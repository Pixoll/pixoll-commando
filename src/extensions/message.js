/* eslint-disable no-unused-vars */
const {
    Util, Message, MessageEmbed, User, MessageOptions, TextBasedChannel, MessageButton, MessageActionRow
} = require('discord.js');
const { oneLine, stripIndent } = require('common-tags');
const Command = require('../commands/base');
const FriendlyError = require('../errors/friendly');
const CommandFormatError = require('../errors/command-format');
const { probability, noReplyInDMs } = require('../util');
/* eslint-enable no-unused-vars */

/**
 * An extension of the base Discord.js Message class to add command-related functionality.
 * @extends Message
 */
class CommandoMessage extends Message {
    /**
     * @param {CommandoClient} client
     * @param {Message} data
     */
    constructor(client, data) {
        super(client, { id: data.id });
        Object.assign(this, data);

        /* eslint-disable no-unused-expressions */
        /**
         * The client the message is for
         * @type {CommandoClient}
         */
        this.client;

        /**
         * The guild this message is for
         * @type {CommandoGuild}
         */
        this.guild;
        /* eslint-enable no-unused-expressions */

        /**
         * Whether the message contains a command (even an unknown one)
         * @type {boolean}
         */
        this.isCommand = false;

        /**
         * Command that the message triggers, if any
         * @type {?Command}
         */
        this.command = null;

        /**
         * Argument string for the command
         * @type {?string}
         */
        this.argString = null;

        /**
         * Pattern matches (if from a pattern trigger)
         * @type {?string[]}
         */
        this.patternMatches = null;

        /**
         * Response messages sent, mapped by channel ID (set by the dispatcher after running the command)
         * @type {Map<string, CommandoMessage[]>}
         */
        this.responses = new Map();

        /**
         * Index of the current response that will be edited, mapped by channel ID
         * @type {Map<string, number>}
         */
        this.responsePositions = new Map();
    }

    /**
     * Initializes the message for a command
     * @param {Command} [command] - Command the message triggers
     * @param {string} [argString] - Argument string for the command
     * @param {?Array<string>} [patternMatches] - Command pattern matches (if from a pattern trigger)
     * @return {Message} This message
     * @private
     */
    initCommand(command, argString, patternMatches) {
        this.isCommand = true;
        this.command = command;
        this.argString = argString;
        this.patternMatches = patternMatches;
        return this;
    }

    /**
     * Creates a usage string for the message's command
     * @param {string} [argString] - A string of arguments for the command
     * @param {string} [prefix=this.guild.prefix || this.client.prefix] - Prefix to use for the
     * prefixed command format
     * @param {User} [user=this.client.user] - User to use for the mention command format
     * @return {string}
     */
    usage(argString, prefix, user = this.client.user) {
        const { guild, client, command } = this;
        prefix ??= guild?.prefix ?? client.prefix;
        return command.usage(argString, prefix, user);
    }

    /**
     * Creates a usage string for any command
     * @param {string} [command] - A command + arg string
     * @param {string} [prefix=this.guild.prefix || this.client.prefix] - Prefix to use for the
     * prefixed command format
     * @param {User} [user=this.client.user] - User to use for the mention command format
     * @return {string}
     */
    anyUsage(command, prefix, user = this.client.user) {
        const { guild, client } = this;
        prefix ??= guild?.prefix ?? client.prefix;
        return Command.usage(command, prefix, user);
    }

    /**
     * Parses the argString into usable arguments, based on the argsType and argsCount of the command
     * @return {string|string[]}
     * @see {@link Command#run}
     */
    parseArgs() {
        const { command, argString } = this;
        const { argsType, argsSingleQuotes, argsCount } = command;
        switch (argsType) {
            case 'single':
                return argString.trim().replace(
                    argsSingleQuotes ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g, '$2'
                );
            case 'multiple':
                return this.constructor.parseArgs(argString, argsCount, argsSingleQuotes);
            default:
                throw new RangeError(`Unknown argsType "${argsType}".`);
        }
    }

    /**
     * Runs the command
     * @return {Promise<?Message|?Array<Message>>}
     */
    async run() {
        const { guild, guildId, channel, channelId, author, webhookId, client, command, patternMatches, argString } = this;
        const { groupId, memberName } = command;

        // Checks if the client has permission to send messages
        const clientPerms = guild?.me.permissionsIn(channel).serialize();
        if (clientPerms && clientPerms.VIEW_CHANNEL && !clientPerms.SEND_MESSAGES) {
            return await this.direct(stripIndent`
                It seems like I cannot **Send Messages** in this channel: ${channel.toString()}
                Please try in another channel, or contact the admins of **${guild.name}** to solve this issue.
            `).catch(() => null);
        }

        // Obtain the member if we don't have it
        if (channel.type !== 'DM' && !guild.members.cache.has(author.id) && !webhookId) {
            this.member = await guild.members.fetch(author);
        }

        // Obtain the member for the ClientUser if it doesn't already exist
        if (channel.type !== 'DM' && !guild.members.cache.has(client.user.id)) {
            await guild.members.fetch(client.user.id);
        }

        // Make sure the command is usable in this context
        if (command.dmOnly && guild) {
            client.emit('commandBlock', { message: this }, 'dmOnly');
            return await command.onBlock({ message: this }, 'dmOnly');
        }

        // Make sure the command is usable in this context
        if ((command.guildOnly || command.guildOwnerOnly) && !guild) {
            client.emit('commandBlock', { message: this }, 'guildOnly');
            return await command.onBlock({ message: this }, 'guildOnly');
        }

        // Ensure the channel is a NSFW one if required
        if (command.nsfw && !channel.nsfw) {
            client.emit('commandBlock', { message: this }, 'nsfw');
            return await command.onBlock({ message: this }, 'nsfw');
        }

        // Ensure the user has permission to use the command
        const hasPermission = command.hasPermission({ message: this });
        if (hasPermission !== true) {
            if (typeof hasPermission === 'string') {
                client.emit('commandBlock', { message: this }, hasPermission);
                return await command.onBlock({ message: this }, hasPermission);
            }
            const data = { missing: hasPermission };
            client.emit('commandBlock', { message: this }, 'userPermissions', data);
            return await command.onBlock({ message: this }, 'userPermissions', data);
        }

        // Ensure the client user has the required permissions
        if (channel.type !== 'DM' && command.clientPermissions) {
            const missing = channel.permissionsFor(client.user).missing(command.clientPermissions);
            if (missing.length > 0) {
                const data = { missing };
                client.emit('commandBlock', { message: this }, 'clientPermissions', data);
                return await command.onBlock({ message: this }, 'clientPermissions', data);
            }
        }

        // Throttle the command
        const throttle = command.throttle(author.id);
        if (throttle && throttle.usages + 1 > command.throttling.usages) {
            const remaining = (throttle.start + (command.throttling.duration * 1000) - Date.now()) / 1000;
            const data = { throttle, remaining };
            client.emit('commandBlock', { message: this }, 'throttling', data);
            return await command.onBlock({ message: this }, 'throttling', data);
        }

        if (command.deprecated) {
            const embed = new MessageEmbed()
                .setColor('GOLD')
                .addField(
                    `The \`${command.name}\` command has been marked as deprecated!`,
                    `Please start using the \`${command.replacing}\` command from now on.`
                );

            await this.replyEmbed(embed);
        }

        // Figure out the command arguments
        let args = patternMatches;
        let collResult = null;
        if (!args && command.argsCollector) {
            const collArgs = command.argsCollector.args;
            const count = collArgs[collArgs.length - 1].infinite ? Infinity : collArgs.length;
            const provided = this.constructor.parseArgs(argString.trim(), count, command.argsSingleQuotes);

            collResult = await command.argsCollector.obtain(this, provided);
            if (collResult.cancelled) {
                if (collResult.prompts.length === 0 || collResult.cancelled === 'promptLimit') {
                    const err = new CommandFormatError(this);
                    return this.reply({ content: err.message, ...noReplyInDMs(this) });
                }

                client.emit('commandCancel', command, collResult.cancelled, this, collResult);
                return this.reply({ content: 'Cancelled command.', ...noReplyInDMs(this) });
            }
            args = collResult.values;
        }
        args ??= this.parseArgs();
        const fromPattern = !!patternMatches;

        // Run the command
        if (throttle) throttle.usages++;
        try {
            const location = guildId ? `${guildId}:${channelId}` : `DM:${author.id}`;
            client.emit('debug', `Running message command "${groupId}:${memberName}" at "${location}".`);
            await channel.sendTyping().catch(() => null);
            const promise = command.run({ message: this }, args, fromPattern, collResult);

            client.emit('commandRun', command, promise, { message: this }, args, fromPattern, collResult);
            const retVal = await promise;
            const isValid = retVal instanceof Message || Array.isArray(retVal) || retVal === null ||
                typeof retVal === 'undefined';
            if (!isValid) {
                const retValType = retVal !== null ? (
                    retVal?.constructor ? retVal.constructor.name : typeof retVal
                ) : null;
                throw new TypeError(oneLine`
                    Command ${command.name}'s run() resolved with an unknown type (${retValType}). Command run methods
                    must return a Promise that resolve with a Message, Array of Messages, or null/undefined.
                `);
            }

            if (probability(2)) {
                const { user, botInvite } = client;
                const embed = new MessageEmbed()
                    .setColor('#4c9f4c')
                    .addField(`Enjoying ${user.username}?`, oneLine`
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

            return retVal;
        } catch (err) {
            const message = await this.fetch().catch(() => null);
            client.emit('commandError', command, err, { message }, args, fromPattern, collResult);
            if (err instanceof FriendlyError) {
                return await this.reply(err.message);
            } else {
                return await command.onError(err, { message }, args, fromPattern, collResult);
            }
        }
    }

    /**
     * Type of the response
     * @typedef {'reply'|'direct'|'plain'|'code'} ResponseType
     */

    /**
     * Options for the response
     * @typedef {Object} ResponseOptions
     * @property {ResponseType} [type] Type of the response
     * @property {string} [content] Content of the response
     * @property {MessageOptions} [options] Options of the response
     * @property {string} [lang] Language of the response, if its type is `code`
     * @property {boolean} [fromEdit] If the response is from an edited message
     */

    /**
     * Responds to the command message
     * @param {ResponseOptions} [options] - Options for the response
     * @return {Message|Message[]}
     * @private
     */
    respond({ type = 'reply', content = '', options = {}, lang = '', fromEdit = false }) {
        const { responses, channel, guild, client, author } = this;
        const shouldEdit = responses && !fromEdit;

        if (type === 'reply' && channel.type === 'DM') type = 'plain';
        if (type !== 'direct') {
            if (guild && !channel.permissionsFor(client.user).has('SEND_MESSAGES')) {
                type = 'direct';
            }
        }

        if (content) options.content = resolveString(content);
        Object.assign(options, noReplyInDMs(this));

        switch (type) {
            case 'plain':
                if (!shouldEdit) return channel.send(options);
                return this.editCurrentResponse(channelIdOrDM(channel), { type, options });
            case 'reply':
                if (!shouldEdit) return this.reply(options);
                return this.editCurrentResponse(channelIdOrDM(channel), { type, options });
            case 'direct':
                if (!shouldEdit) return author.send(options);
                return this.editCurrentResponse('DM', { type, options });
            case 'code':
                options.content = `\`\`\`${lang}\n${Util.escapeMarkdown(content, true)}\n\`\`\``;
                if (!shouldEdit) return channel.send(options);
                return this.editCurrentResponse(channelIdOrDM(channel), { type, options });
            default:
                throw new RangeError(`Unknown response type "${type}".`);
        }
    }

    /**
     * Edits a response to the command message
     * @param {Message|Message[]} response - The response message(s) to edit
     * @param {ResponseOptions} [options] - Options for the response
     * @return {Promise<Message|Message[]>}
     * @private
     */
    editResponse(response, { type, options }) {
        if (!response) return this.respond({ type, options, fromEdit: true });

        const { content } = options;
        if (Array.isArray(content)) {
            const promises = [];
            if (Array.isArray(response)) {
                for (let i = 0; i < content.length; i++) {
                    if (response.length > i) promises.push(response[i].edit(`${content[i]}`/* , options */));
                    else promises.push(response[0].channel.send(`${content[i]}`));
                }
            } else {
                promises.push(response.edit(`${content[0]}`/* , options */));
                for (let i = 1; i < content.length; i++) {
                    promises.push(response.channel.send(`${content[i]}`));
                }
            }
            return Promise.all(promises);
        } else {
            if (Array.isArray(response)) {
                for (let i = response.length - 1; i > 0; i--) response[i]?.delete();
                return response[0].edit(options);
            } else {
                return response.edit(options);
            }
        }
    }

    /**
     * Edits the current response
     * @param {string} id - The ID of the channel the response is in ("DM" for direct messages)
     * @param {ResponseOptions} [options] - Options for the response
     * @return {Promise<Message|Message[]>}
     * @private
     */
    editCurrentResponse(id, options) {
        const { responses, responsePositions } = this;
        if (typeof responses.get(id) === 'undefined') responses.set(id, []);
        if (typeof responsePositions.get(id) === 'undefined') responsePositions.set(id, -1);
        let pos = this.responsePositions.get(id);
        this.responsePositions.set(id, ++pos);
        const response = this.responses.get(id);
        return this.editResponse(response[pos], options);
    }

    /**
     * Responds with a plain message
     * @param {StringResolvable} content - Content for the message
     * @param {MessageOptions} [options] - Options for the message
     * @return {Promise<Message|Message[]>}
     */
    say(content, options) {
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            content = null;
        }
        if (typeof options !== 'object') options = {};
        return this.respond({ type: 'plain', content, options });
    }

    /**
     * Responds with a direct message
     * @param {StringResolvable} content - Content for the message
     * @param {MessageOptions} [options] - Options for the message
     * @return {Promise<Message|Message[]>}
     */
    direct(content, options) {
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            content = null;
        }
        if (typeof options !== 'object') options = {};
        return this.respond({ type: 'direct', content, options });
    }

    /**
     * Responds with a code message
     * @param {string} lang - Language for the code block
     * @param {StringResolvable} content - Content for the message
     * @param {MessageOptions} [options] - Options for the message
     * @return {Promise<Message|Message[]>}
     */
    code(lang, content, options) {
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            content = null;
        }
        if (typeof options !== 'object') options = {};
        return this.respond({ type: 'code', content, lang, options });
    }

    /**
     * Responds with an embed
     * @param {MessageEmbed|MessageEmbed[]} embed - Embed to send
     * @param {StringResolvable} [content] - Content for the message
     * @param {MessageOptions} [options] - Options for the message
     * @return {Promise<Message|Message[]>}
     */
    embed(embed, content, options) {
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            content = null;
        }
        if (typeof options !== 'object') options = {};
        options.embeds = Array.isArray(embed) ? embed : [embed];
        return this.respond({ type: 'plain', content, options });
    }

    /**
     * Responds with a reply + embed
     * @param {MessageEmbed|MessageEmbed[]} embed - Embed to send
     * @param {StringResolvable} [content] - Content for the message
     * @param {MessageOptions} [options] - Options for the message
     * @return {Promise<Message|Message[]>}
     */
    replyEmbed(embed, content = '', options) {
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            content = null;
        }
        if (typeof options !== 'object') options = {};
        options.embeds = Array.isArray(embed) ? embed : [embed];
        return this.respond({ type: 'reply', content, options });
    }

    /**
     * Finalizes the command message by setting the responses and deleting any remaining prior ones
     * @param {?Array<Message|Message[]>} responses - Responses to the message
     * @private
     */
    finalize(responses) {
        const { responsePositions, responses: _responses } = this;

        if (_responses) this.deleteRemainingResponses();
        _responses.clear();
        responsePositions.clear();

        if (Array.isArray(responses)) {
            for (const response of responses) {
                const channel = (Array.isArray(response) ? response[0] : response).channel;
                const id = channelIdOrDM(channel);
                if (!_responses.get(id)) {
                    _responses.set(id, []);
                    responsePositions.set(id, -1);
                }
                _responses.get(id).push(response);
            }
        } else if (responses) {
            const id = channelIdOrDM(responses.channel);
            _responses.set(id, responses);
            responsePositions.set(id, -1);
        }
    }

    /**
     * Deletes any prior responses that haven't been updated
     * @private
     */
    deleteRemainingResponses() {
        const { responses: _responses, responsePositions } = this;
        for (const [id, responses] of _responses) {
            for (let i = responsePositions.get(id) + 1; i < responses.length; i++) {
                const response = responses[i];
                if (Array.isArray(response)) {
                    for (const resp of response) resp?.delete();
                } else {
                    response?.delete();
                }
            }
        }
    }

    /**
     * Parses an argument string into an array of arguments
     * @param {string} argString - The argument string to parse
     * @param {number} [argCount] - The number of arguments to extract from the string
     * @param {boolean} [allowSingleQuote=true] - Whether or not single quotes should be allowed to wrap arguments,
     * in addition to double quotes
     * @return {string[]} The array of arguments
     */
    static parseArgs(argString, argCount, allowSingleQuote = true) {
        const argStringModified = removeSmartQuotes(argString, allowSingleQuote);
        const re = allowSingleQuote ? /\s*(?:("|')([^]*?)\1|(\S+))\s*/g : /\s*(?:(")([^]*?)"|(\S+))\s*/g;
        const result = [];
        let match = [];
        // Large enough to get all items
        argCount ||= argStringModified.length;
        // Get match and push the capture group that is not null to the result
        while (--argCount && (match = re.exec(argStringModified))) result.push(match[2] || match[3]);
        // If text remains, push it to the array as-is (except for wrapping quotes, which are removed)
        if (match && re.lastIndex < argStringModified.length) {
            const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g;
            result.push(argStringModified.substring(re.lastIndex, argStringModified.length).replace(re2, '$2'));
        }
        return result;
    }
}

/**
 * @param {string} argString
 * @param {boolean} [allowSingleQuote=true]
 */
function removeSmartQuotes(argString, allowSingleQuote = true) {
    let replacementArgString = argString;
    const singleSmartQuote = /[\u2018\u2019]/g;
    const doubleSmartQuote = /[“”]/g;
    if (allowSingleQuote) replacementArgString = argString.replace(singleSmartQuote, '\'');
    return replacementArgString.replace(doubleSmartQuote, '"');
}

/** @param {TextBasedChannel} channel */
function channelIdOrDM(channel) {
    if (channel.type !== 'DM') return channel.id;
    return 'DM';
}

module.exports = CommandoMessage;

/**
 * Resolves a StringResolvable to a string.
 * @param {StringResolvable} data The string resolvable to resolve
 * @returns {string}
 */
function resolveString(data) {
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.join('\n');
    return String(data);
}
