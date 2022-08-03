"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("./util"));
/** Handles parsing messages and running commands from them */
class CommandDispatcher {
    /** Registry this dispatcher uses */
    registry;
    /** Functions that can block commands from running */
    inhibitors;
    /** Map of {@link RegExp}s that match command messages, mapped by string prefix */
    _commandPatterns;
    /** Old command message results, mapped by original message ID */
    _results;
    /** Tuples in string form of user ID and channel ID that are currently awaiting messages from a user in a channel */
    _awaiting;
    /**
     * @param client - Client the dispatcher is for
     * @param registry - Registry the dispatcher will use
     */
    constructor(client, registry) {
        Object.defineProperty(this, 'client', { value: client });
        this.registry = registry;
        this.inhibitors = new Set();
        this._commandPatterns = new Map();
        this._results = new Map();
        this._awaiting = new Set();
    }
    /**
     * Adds an inhibitor
     * @param inhibitor - The inhibitor function to add
     * @return Whether the addition was successful
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
        if (typeof inhibitor !== 'function')
            throw new TypeError('The inhibitor must be a function.');
        if (inhibitors.has(inhibitor))
            return false;
        inhibitors.add(inhibitor);
        return true;
    }
    /**
     * Removes an inhibitor
     * @param inhibitor - The inhibitor function to remove
     * @return Whether the removal was successful
     */
    removeInhibitor(inhibitor) {
        if (typeof inhibitor !== 'function')
            throw new TypeError('The inhibitor must be a function.');
        return this.inhibitors.delete(inhibitor);
    }
    /**
     * Handle a new message or a message update
     * @param message - The message to handle
     * @param oldMessage - The old message before the update
     */
    async handleMessage(message, oldMessage) {
        if (!this.shouldHandleMessage(message, oldMessage))
            return;
        const { client, _results } = this;
        const { nonCommandEditable } = client.options;
        // Parse the message, and get the old result if it exists
        let cmdMsg;
        let oldCmdMsg;
        if (oldMessage) {
            oldCmdMsg = _results.get(oldMessage.id);
            if (!oldCmdMsg && !nonCommandEditable)
                return;
            cmdMsg = this.parseMessage(message);
            if (cmdMsg && oldCmdMsg) {
                cmdMsg.responses = oldCmdMsg.responses;
                cmdMsg.responsePositions = oldCmdMsg.responsePositions;
            }
        }
        else {
            cmdMsg = this.parseMessage(message);
        }
        // Run the command, or reply with an error
        let responses = null;
        if (cmdMsg) {
            commandResponses: {
                const inhibited = this.inhibit(cmdMsg);
                if (inhibited) {
                    responses = await inhibited.response ?? null;
                    break commandResponses;
                }
                if (!cmdMsg.command) {
                    client.emit('unknownCommand', cmdMsg);
                    responses = null;
                    break commandResponses;
                }
                if (!cmdMsg.command.isEnabledIn(message.guild)) {
                    if (cmdMsg.command.unknown) {
                        client.emit('unknownCommand', cmdMsg);
                        responses = null;
                        break commandResponses;
                    }
                    const responseEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(discord_js_1.Colors.Red)
                        .setDescription(`The \`${cmdMsg.command.name}\` command is disabled.`);
                    responses = await cmdMsg.replyEmbed(responseEmbed);
                    break commandResponses;
                }
                if (!oldMessage || typeof oldCmdMsg !== 'undefined') {
                    responses = await cmdMsg.run();
                    if (typeof responses === 'undefined')
                        responses = null;
                    if (Array.isArray(responses))
                        responses = await Promise.all(responses);
                }
            }
            // @ts-expect-error: finalize is protected in CommandoMessage
            cmdMsg.finalize(responses);
        }
        else if (oldCmdMsg) {
            // @ts-expect-error: finalize is protected in CommandoMessage
            oldCmdMsg.finalize(null);
            if (!nonCommandEditable)
                _results.delete(message.id);
        }
        if (cmdMsg && oldMessage) {
            client.emit('commandoMessageUpdate', oldMessage, cmdMsg);
        }
        this.cacheCommandoMessage(message, oldMessage, cmdMsg, responses);
    }
    /**
     * Handle a new slash command interaction
     * @param interaction - The interaction to handle
     */
    async handleSlash(interaction) {
        if (!this.shouldHandleSlash(interaction))
            return;
        const { command, guild } = interaction;
        if (!command.isEnabledIn(guild)) {
            const responseEmbed = new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Red)
                .setDescription(`The \`${command.name}\` command is disabled.`);
            await interaction.reply({
                embeds: [responseEmbed],
                ephemeral: true,
            });
            return;
        }
        interaction.run();
    }
    /**
     * Check whether a message should be handled
     * @param message - The message to handle
     * @param oldMessage - The old message before the update
     */
    shouldHandleMessage(message, oldMessage) {
        const { partial, author, channelId, content, client } = message;
        const { _awaiting } = this;
        // Ignore partial and bot messages
        if (partial)
            return false;
        if (author.bot || author.id === client.user.id)
            return false;
        // Ignore messages from users that the bot is already waiting for input from
        if (_awaiting.has(author.id + channelId))
            return false;
        // Make sure the edit actually changed the message content
        if (oldMessage && content === oldMessage.content)
            return false;
        return true;
    }
    /**
     * Check whether an interaction should be handled
     * @param interaction - The interaction to handle
     */
    shouldHandleSlash(interaction) {
        const { author, client, commandType, type } = interaction;
        // Ignore bot messages
        if (author.bot || author.id === client.user.id)
            return false;
        // Ignore anything but slash commands
        if (type !== discord_js_1.InteractionType.ApplicationCommand)
            return false;
        if (commandType !== discord_js_1.ApplicationCommandType.ChatInput)
            return false;
        return true;
    }
    /**
     * Inhibits a command message
     * @param message - Command message to inhibit
     */
    inhibit(message) {
        const { inhibitors, client } = this;
        for (const inhibitor of inhibitors) {
            let inhibit = inhibitor(message);
            if (inhibit) {
                if (typeof inhibit !== 'object')
                    inhibit = { reason: inhibit, response: null };
                const valid = typeof inhibit.reason === 'string'
                    && (util_1.default.isNullish(inhibit.response)
                        || util_1.default.isPromise(inhibit.response));
                if (!valid) {
                    throw new TypeError(`Inhibitor "${inhibitor.name}" had an invalid result must be a string or an Inhibition object.`);
                }
                client.emit('commandBlock', { message }, inhibit.reason);
                return inhibit;
            }
        }
        return null;
    }
    /**
     * Caches a command message to be editable
     * @param message - Triggering message
     * @param oldMessage - Triggering message's old version
     * @param cmdMsg - Command message to cache
     * @param responses - Responses to the message
     */
    cacheCommandoMessage(message, oldMessage, cmdMsg, responses) {
        const { client, _results } = this;
        const { commandEditableDuration, nonCommandEditable } = client.options;
        const { id } = message;
        if (commandEditableDuration <= 0)
            return;
        if (!cmdMsg && !nonCommandEditable)
            return;
        if (responses !== null && cmdMsg) {
            _results.set(id, cmdMsg);
            if (!oldMessage) {
                setTimeout(() => {
                    _results.delete(id);
                }, commandEditableDuration * 1000);
            }
            return;
        }
        _results.delete(id);
    }
    /**
     * Parses a message to find details about command usage in it
     * @param message - The message
     */
    parseMessage(message) {
        const { client, _commandPatterns, registry } = this;
        const { content, guild } = message;
        // Find the command to run by patterns
        for (const command of registry.commands.values()) {
            if (!command.patterns)
                continue;
            for (const pattern of command.patterns) {
                const matches = pattern.exec(content);
                // @ts-expect-error: initCommand is protected in CommandoMessage
                if (matches)
                    return message.initCommand(command, null, matches);
            }
        }
        // Find the command to run with default command handling
        const prefix = (guild?.prefix || client.prefix);
        if (!_commandPatterns.get(prefix))
            this.buildCommandPattern(prefix);
        let cmdMsg = this.matchDefault(message, _commandPatterns.get(prefix), 2);
        if (!cmdMsg && !guild)
            cmdMsg = this.matchDefault(message, /^([^\s]+)/i, 1, true);
        return cmdMsg;
    }
    /**
     * Matches a message against a guild command pattern
     * @param message - The message
     * @param pattern - The pattern to match against
     * @param commandNameIndex - The index of the command name in the pattern matches
     * @param prefixless - Whether the match is happening for a prefixless usage
     */
    matchDefault(message, pattern, commandNameIndex = 1, prefixless = false) {
        const { content } = message;
        const { registry } = this;
        const matches = pattern.exec(content);
        if (!matches)
            return null;
        const commands = registry.findCommands(matches[commandNameIndex], true);
        if (commands.length !== 1 || !commands[0].defaultHandling) {
            // @ts-expect-error: initCommand is protected in CommandoMessage
            return message.initCommand(registry.unknownCommand, prefixless ? content : matches[1], null);
        }
        const argString = content.substring(matches[1].length + (matches[2]?.length ?? 0));
        // @ts-expect-error: initCommand is protected in CommandoMessage
        return message.initCommand(commands[0], argString, null);
    }
    /**
     * Creates a regular expression to match the command prefix and name in a message
     * @param prefix - Prefix to build the pattern for
     */
    buildCommandPattern(prefix) {
        const { client, _commandPatterns } = this;
        const { id } = client.user;
        let pattern;
        if (prefix) {
            const escapedPrefix = util_1.default.escapeRegex(prefix);
            pattern = new RegExp(`^(<@!?${id}>\\s+(?:${escapedPrefix}\\s*)?|${escapedPrefix}\\s*)([^\\s]+)`, 'i');
        }
        else {
            pattern = new RegExp(`(^<@!?${id}>\\s+)([^\\s]+)`, 'i');
        }
        _commandPatterns.set(prefix, pattern);
        client.emit('debug', `Built command pattern for prefix "${prefix}": ${pattern}`);
        return pattern;
    }
}
exports.default = CommandDispatcher;
//# sourceMappingURL=dispatcher.js.map