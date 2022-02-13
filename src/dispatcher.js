const { escapeRegex, removeDashes, isPromise, probability } = require('./util');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { oneLine, stripIndent } = require('common-tags');
const FriendlyError = require('./errors/friendly');

/** Handles parsing messages and running commands from them */
class CommandDispatcher {
	/**
	 * @param {CommandoClient} client - Client the dispatcher is for
	 * @param {CommandoRegistry} registry - Registry the dispatcher will use
	 */
	constructor(client, registry) {
		/**
		 * Client this dispatcher handles messages for
		 * @name CommandDispatcher#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The client this registry is for
		 * @type {CommandoClient}
		 * @readonly
		 */
		// eslint-disable-next-line no-unused-expressions
		this.client;

		/**
		 * Registry this dispatcher uses
		 * @type {CommandoRegistry}
		 */
		this.registry = registry;

		/**
		 * Functions that can block commands from running
		 * @type {Set<Inhibitor>}
		 */
		this.inhibitors = new Set();

		/**
		 * Map of {@link RegExp}s that match command messages, mapped by string prefix
		 * @type {Map<string, RegExp>}
		 * @private
		 */
		this._commandPatterns = new Map();

		/**
		 * Old command message results, mapped by original message ID
		 * @type {Map<string, CommandoMessage>}
		 * @private
		 */
		this._results = new Map();

		/**
		 * Tuples in string form of user ID and channel ID that are currently awaiting messages from a user in a channel
		 * @type {Set<string>}
		 * @private
		 */
		this._awaiting = new Set();
	}

	/**
	 * @typedef {Object} Inhibition
	 * @property {string} reason - Identifier for the reason the command is being blocked
	 * @property {?Promise<Message>} response - Response being sent to the user
	 */

	/**
	 * A function that decides whether the usage of a command should be blocked
	 * @callback Inhibitor
	 * @param {CommandoMessage} msg - Message triggering the command
	 * @return {boolean|string|Inhibition} `false` if the command should *not* be blocked.
	 * If the command *should* be blocked, then one of the following:
	 * - A single string identifying the reason the command is blocked
	 * - An Inhibition object
	 */

	/**
	 * Adds an inhibitor
	 * @param {Inhibitor} inhibitor - The inhibitor function to add
	 * @return {boolean} Whether the addition was successful
	 * @example
	 * client.dispatcher.addInhibitor(msg => {
	 *     if (blacklistedUsers.has(msg.author.id)) return 'blacklisted';
	 * });
	 * @example
	 * client.dispatcher.addInhibitor(msg => {
	 *     if (!coolUsers.has(msg.author.id)) return { reason: 'cool', response: msg.reply('You\'re not cool enough!') };
	 * });
	 */
	addInhibitor(inhibitor) {
		const { inhibitors } = this;
		if (typeof inhibitor !== 'function') throw new TypeError('The inhibitor must be a function.');
		if (inhibitors.has(inhibitor)) return false;
		inhibitors.add(inhibitor);
		return true;
	}

	/**
	 * Removes an inhibitor
	 * @param {Inhibitor} inhibitor - The inhibitor function to remove
	 * @return {boolean} Whether the removal was successful
	 */
	removeInhibitor(inhibitor) {
		if (typeof inhibitor !== 'function') throw new TypeError('The inhibitor must be a function.');
		return this.inhibitors.delete(inhibitor);
	}

	/**
	 * Handle a new message or a message update
	 * @param {Message} message - The message to handle
	 * @param {Message} [oldMessage] - The old message before the update
	 * @return {Promise<void>}
	 * @private
	 */
	async handleMessage(message, oldMessage) {
		if (!this.shouldHandleMessage(message, oldMessage)) return;

		const { client, _results } = this;
		const { nonCommandEditable } = client.options;

		// Parse the message, and get the old result if it exists
		let cmdMsg, oldCmdMsg;
		if (oldMessage) {
			oldCmdMsg = _results.get(oldMessage.id);
			if (!oldCmdMsg && !nonCommandEditable) return;
			cmdMsg = this.parseMessage(message);
			if (cmdMsg && oldCmdMsg) {
				cmdMsg.responses = oldCmdMsg.responses;
				cmdMsg.responsePositions = oldCmdMsg.responsePositions;
			}
		} else {
			cmdMsg = this.parseMessage(message);
		}

		// Run the command, or reply with an error
		let responses;
		if (cmdMsg) {
			const inhibited = this.inhibit(cmdMsg);

			if (!inhibited) {
				if (cmdMsg.command) {
					if (!cmdMsg.command.isEnabledIn(message.guild)) {
						if (!cmdMsg.command.unknown) {
							responses = await cmdMsg.replyEmbed(
								new MessageEmbed().setColor('RED').setDescription(
									`The \`${cmdMsg.command.name}\` command is disabled.`
								)
							);
						} else {
							client.emit('unknownCommand', cmdMsg);
							responses = null;
						}
					} else if (!oldMessage || typeof oldCmdMsg !== 'undefined') {
						responses = await cmdMsg.run();
						if (typeof responses === 'undefined') responses = null;
						if (Array.isArray(responses)) responses = await Promise.all(responses);
					}
				} else {
					client.emit('unknownCommand', cmdMsg);
					responses = null;
				}
			} else {
				responses = await inhibited.response;
			}

			cmdMsg.finalize(responses);
		} else if (oldCmdMsg) {
			oldCmdMsg.finalize(null);
			if (!nonCommandEditable) _results.delete(message.id);
		}

		if (cmdMsg && oldMessage) {
			client.emit('commandoMessageUpdate', oldMessage, cmdMsg);
		}

		this.cacheCommandoMessage(message, oldMessage, cmdMsg, responses);
	}

	/**
	 * Handle a slash command interaction
	 * @param {CommandoInteraction} interaction The interaction to handle
	 * @return {Promise<void>}
	 * @private
	 */
	async handleSlash(interaction) {
		if (!interaction.isCommand()) return;

		// Get the matching command
		/** @type {CommandoInteraction} */
		const { commandName, channelId, channel, guild, user, guildId, client, options, deferred, replied } = interaction;
		const command = this.registry.resolveCommand(commandName);
		if (!command) return;
		const { groupId, memberName } = command;

		const missingSlash = guild?.me.permissionsIn(channel).missing('USE_APPLICATION_COMMANDS');
		if (missingSlash && missingSlash.length !== 0) {
			return await user.send(stripIndent`
				It seems like I cannot **Use Application Commands** in this channel: ${channel.toString()}
				Please try in another channel, or contact the admins of **${guild.name}** to solve this issue.
			`).catch(() => null);
		}

		// Obtain the member if we don't have it
		if (channel.type !== 'DM' && !guild.members.cache.has(user.id)) {
			interaction.member = await guild.members.fetch(user);
		}

		// Obtain the member for the ClientUser if it doesn't already exist
		if (channel.type !== 'DM' && !guild.members.cache.has(client.user.id)) {
			await guild.members.fetch(client.user.id);
		}

		// Make sure the command is usable in this context
		if (command.dmOnly && guild) {
			client.emit('commandBlock', { interaction }, 'dmOnly');
			return await command.onBlock({ interaction }, 'dmOnly');
		}

		// Make sure the command is usable in this context
		if ((command.guildOnly || command.guildOwnerOnly) && !guild) {
			client.emit('commandBlock', { interaction }, 'guildOnly');
			return await command.onBlock({ interaction }, 'guildOnly');
		}

		// Ensure the channel is a NSFW one if required
		if (command.nsfw && !channel.nsfw) {
			client.emit('commandBlock', { interaction }, 'nsfw');
			return await command.onBlock({ interaction }, 'nsfw');
		}

		// Ensure the user has permission to use the command
		const hasPermission = command.hasPermission({ interaction });
		if (hasPermission !== true) {
			if (typeof hasPermission === 'string') {
				client.emit('commandBlock', { interaction }, hasPermission);
				return await command.onBlock({ interaction }, hasPermission);
			}
			const data = { missing: hasPermission };
			client.emit('commandBlock', { interaction }, 'userPermissions', data);
			return await command.onBlock({ interaction }, 'userPermissions', data);
		}

		// Ensure the client user has the required permissions
		if (channel.type !== 'DM' && command.clientPermissions) {
			const missing = channel.permissionsFor(client.user).missing(command.clientPermissions);
			if (missing.length > 0) {
				const data = { missing };
				client.emit('commandBlock', { interaction }, 'clientPermissions', data);
				return await command.onBlock({ interaction }, 'clientPermissions', data);
			}
		}

		if (command.deprecated) {
			const embed = new MessageEmbed()
				.setColor('GOLD')
				.addField(
					`The \`${command.name}\` command has been marked as deprecated!`,
					`Please start using the \`${command.replacing}\` command from now on.`
				);

			await channel.send({ content: user.toString(), embeds: [embed] });
		}

		// Parses the options into an arguments object
		const args = {};
		for (const option of options.data) parseSlashArgs(args, option);

		// Run the command
		try {
			const location = guildId ? `${guildId}:${channelId}` : `DM:${user.id}`;
			client.emit('debug', `Running slash command "${groupId}:${memberName}" at "${location}".`);
			await interaction.deferReply({ ephemeral: !!command.slash.ephemeral }).catch(() => null);
			const promise = command.run({ interaction }, args);

			client.emit('commandRun', command, promise, { interaction }, args);
			await promise;

			if (probability(2)) {
				const { user: clientUser, botInvite } = client;
				const embed = new MessageEmbed()
					.setColor('#4c9f4c')
					.addField(`Enjoying ${clientUser.username}?`, oneLine`
						The please consider voting for it! It helps the bot to become more noticed
						between other bots. And perhaps consider adding it to any of your own servers
						as well!
					`);
				const vote = new MessageButton()
					.setEmoji('👍')
					.setLabel('Vote me')
					.setStyle('LINK')
					.setURL('https://top.gg/bot/802267523058761759/vote');
				const invite = new MessageButton()
					.setEmoji('🔗')
					.setLabel('Invite me')
					.setStyle('LINK')
					.setURL(botInvite);
				const row = new MessageActionRow().addComponents(vote, invite);
				await channel.send({ embeds: [embed], components: [row] }).catch(() => null);
			}

			return;
		} catch (err) {
			client.emit('commandError', command, err, { interaction });
			if (err instanceof FriendlyError) {
				if (deferred || replied) {
					return await interaction.editReply({ content: err.message, components: [], embeds: [] });
				} else {
					return await interaction.reply(err.message);
				}
			} else {
				return await command.onError(err, { interaction }, args);
			}
		}
	}

	/**
	 * Check whether a message should be handled
	 * @param {Message} message - The message to handle
	 * @param {Message} [oldMessage] - The old message before the update
	 * @return {boolean}
	 * @private
	 */
	shouldHandleMessage(message, oldMessage) {
		const { partial, author, channelId, content } = message;
		const { client, _awaiting } = this;

		// Ignore partial messages
		if (partial) return false;

		if (author.bot) return false;
		else if (author.id === client.user.id) return false;

		// Ignore messages from users that the bot is already waiting for input from
		if (_awaiting.has(author.id + channelId)) return false;

		// Make sure the edit actually changed the message content
		if (oldMessage && content === oldMessage.content) return false;

		return true;
	}

	/**
	 * Inhibits a command message
	 * @param {CommandoMessage} cmdMsg - Command message to inhibit
	 * @return {?Inhibition}
	 * @private
	 */
	inhibit(cmdMsg) {
		const { inhibitors, client } = this;
		for (const inhibitor of inhibitors) {
			let inhibit = inhibitor(cmdMsg);
			if (inhibit) {
				if (typeof inhibit !== 'object') inhibit = { reason: inhibit, response: null };

				const valid = typeof inhibit.reason === 'string' && (
					typeof inhibit.response === 'undefined' ||
					inhibit.response === null ||
					isPromise(inhibit.response)
				);
				if (!valid) {
					throw new TypeError(
						`Inhibitor "${inhibitor.name}" had an invalid result must be a string or an Inhibition object.`
					);
				}

				client.emit('commandBlock', { message: cmdMsg }, inhibit.reason, inhibit);
				return inhibit;
			}
		}
		return null;
	}

	/**
	 * Caches a command message to be editable
	 * @param {Message} message - Triggering message
	 * @param {Message} oldMessage - Triggering message's old version
	 * @param {CommandoMessage} cmdMsg - Command message to cache
	 * @param {Message|Message[]} responses - Responses to the message
	 * @private
	 */
	cacheCommandoMessage(message, oldMessage, cmdMsg, responses) {
		const { client, _results } = this;
		const { commandEditableDuration, nonCommandEditable } = client.options;
		const { id } = message;

		if (commandEditableDuration <= 0) return;
		if (!cmdMsg && !nonCommandEditable) return;
		if (responses !== null) {
			_results.set(id, cmdMsg);
			if (!oldMessage) {
				setTimeout(() => {
					_results.delete(id);
				}, commandEditableDuration * 1000);
			}
		} else {
			_results.delete(id);
		}
	}

	/**
	 * Parses a message to find details about command usage in it
	 * @param {Message} message - The message
	 * @return {?CommandoMessage}
	 * @private
	 */
	parseMessage(message) {
		const { client, _commandPatterns, registry } = this;
		const { content, guild } = message;

		// Find the command to run by patterns
		for (const command of registry.commands.values()) {
			if (!command.patterns) continue;
			for (const pattern of command.patterns) {
				const matches = pattern.exec(content);
				if (matches) return message.initCommand(command, null, matches);
			}
		}

		// Find the command to run with default command handling
		const prefix = guild?.prefix || client.prefix;
		if (!_commandPatterns.get(prefix)) this.buildCommandPattern(prefix);
		let cmdMsg = this.matchDefault(message, _commandPatterns.get(prefix), 2);
		if (!cmdMsg && !guild) cmdMsg = this.matchDefault(message, /^([^\s]+)/i, 1, true);
		return cmdMsg;
	}

	/**
	 * Matches a message against a guild command pattern
	 * @param {Message} message - The message
	 * @param {RegExp} pattern - The pattern to match against
	 * @param {number} commandNameIndex - The index of the command name in the pattern matches
	 * @param {boolean} prefixless - Whether the match is happening for a prefixless usage
	 * @return {?CommandoMessage}
	 * @private
	 */
	matchDefault(message, pattern, commandNameIndex = 1, prefixless = false) {
		const { content } = message;
		const { registry } = this;

		const matches = pattern.exec(content);
		if (!matches) return null;
		const commands = registry.findCommands(matches[commandNameIndex], true);
		if (commands.length !== 1 || !commands[0].defaultHandling) {
			return message.initCommand(registry.unknownCommand, prefixless ? content : matches[1]);
		}
		const argString = content.substring(matches[1].length + (matches[2] ? matches[2].length : 0));
		return message.initCommand(commands[0], argString);
	}

	/**
	 * Creates a regular expression to match the command prefix and name in a message
	 * @param {?string} prefix - Prefix to build the pattern for
	 * @return {RegExp}
	 * @private
	 */
	buildCommandPattern(prefix) {
		const { client, _commandPatterns } = this;
		const { id } = client.user;

		let pattern;
		if (prefix) {
			const escapedPrefix = escapeRegex(prefix);
			pattern = new RegExp(
				`^(<@!?${id}>\\s+(?:${escapedPrefix}\\s*)?|${escapedPrefix}\\s*)([^\\s]+)`, 'i'
			);
		} else {
			pattern = new RegExp(`(^<@!?${id}>\\s+)([^\\s]+)`, 'i');
		}
		_commandPatterns.set(prefix, pattern);
		client.emit('debug', `Built command pattern for prefix "${prefix}": ${pattern}`);
		return pattern;
	}
}

module.exports = CommandDispatcher;

/**
 * @param {Object} obj
 * @param {CommandInteractionOption} opt
 */
function parseSlashArgs(obj, { name, value, type, channel, member, user, role, options }) {
	if (name && [undefined, null].includes(value)) {
		obj.subCommand = name;
	} else {
		name = removeDashes(name);
		switch (type) {
			case 'BOOLEAN':
			case 'INTEGER':
			case 'NUMBER':
			case 'STRING':
			case 'SUB_COMMAND':
				obj[name] = value ?? null;
				break;
			case 'CHANNEL':
				obj[name] = channel ?? null;
				break;
			case 'MENTIONABLE':
				obj[name] = member ?? user ?? channel ?? role ?? null;
				break;
			case 'ROLE':
				obj[name] = role ?? null;
				break;
			case 'USER':
				obj[name] = member ?? user ?? null;
				break;
		}
	}
	options?.forEach(opt => parseSlashArgs(obj, opt));
}
