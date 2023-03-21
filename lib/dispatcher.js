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
                this.client.emit('commandoMessageUpdate', oldCmdMsg, cmdMsg);
            }
        }
        else {
            cmdMsg = this.parseMessage(message);
            this.client.emit('commandoMessageCreate', cmdMsg ?? message);
        }
        // Run the command, or reply with an error
        let responses = null;
        if (cmdMsg) {
            commandResponses: {
                const { command, author } = cmdMsg;
                const inhibited = this.inhibit(cmdMsg);
                if (inhibited) {
                    responses = await inhibited.response ?? null;
                    break commandResponses;
                }
                if (!command || command.unknown) {
                    client.emit('unknownCommand', cmdMsg);
                    responses = null;
                    break commandResponses;
                }
                if (!command.isEnabledIn(message.guild) && (!command.hidden || this.client.isOwner(author))) {
                    const responseEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(discord_js_1.Colors.Red)
                        .setDescription(`The \`${command.name}\` command is disabled.`);
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
        this.cacheCommandoMessage(message, oldMessage, cmdMsg, responses);
    }
    /**
     * Handle a new interaction
     * @param interaction - The interaction to handle
     */
    async handleInteraction(interaction) {
        if (interaction.isChatInputCommand()) {
            await this.handleChatInputCommand(interaction);
            return;
        }
        if (!interaction.isAutocomplete() && !interaction.isContextMenuCommand())
            return;
        const { client, commandName } = interaction;
        const command = client.registry.resolveCommand(commandName);
        if (interaction.isAutocomplete()) {
            await command.runAutocomplete?.(interaction);
            return;
        }
        if (interaction.isMessageContextMenuCommand()) {
            await command.runMessageContextMenu?.(interaction);
            return;
        }
        if (interaction.isUserContextMenuCommand()) {
            await command.runUserContextMenu?.(interaction);
            return;
        }
    }
    /**
     * Handle a new slash command interaction
     * @param interaction - The interaction to handle
     */
    async handleChatInputCommand(interaction) {
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
        await interaction.run();
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
     * Inhibits a command message
     * @param message - Command message to inhibit
     */
    inhibit(message) {
        const { inhibitors, client } = this;
        for (const inhibitor of inhibitors) {
            let inhibit = inhibitor(message);
            if (!inhibit)
                continue;
            if (typeof inhibit !== 'object')
                inhibit = { reason: inhibit, response: null };
            const valid = typeof inhibit.reason === 'string' && (util_1.default.isNullish(inhibit.response)
                || util_1.default.isPromise(inhibit.response));
            if (!valid)
                throw new TypeError(`Inhibitor "${inhibitor.name}" had an invalid result must be a string or an Inhibition object.`);
            client.emit('commandBlock', message, inhibit.reason);
            return inhibit;
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
        if (!commandEditableDuration || commandEditableDuration <= 0)
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
        const prefix = guild?.prefix || client.prefix;
        const pattern = _commandPatterns.get(prefix) ?? this.buildCommandPattern(prefix);
        let cmdMsg = this.matchDefault(message, pattern, 2);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBQTJEO0FBUTNELGtEQUEwQjtBQXVCMUIsOERBQThEO0FBQzlELE1BQXFCLGlCQUFpQjtJQUdsQyxvQ0FBb0M7SUFDN0IsUUFBUSxDQUFtQjtJQUNsQyxxREFBcUQ7SUFDOUMsVUFBVSxDQUFpQjtJQUNsQyxrRkFBa0Y7SUFDeEUsZ0JBQWdCLENBQWtDO0lBQzVELGlFQUFpRTtJQUN2RCxRQUFRLENBQStCO0lBQ2pELG9IQUFvSDtJQUMxRyxTQUFTLENBQWM7SUFFakM7OztPQUdHO0lBQ0gsWUFBbUIsTUFBc0IsRUFBRSxRQUEwQjtRQUNqRSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0ksWUFBWSxDQUFDLFNBQW9CO1FBQ3BDLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxPQUFPLFNBQVMsS0FBSyxVQUFVO1lBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBQzlGLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUM1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