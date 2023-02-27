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
                client.emit('commandBlock', message, inhibit.reason);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBTW9CO0FBT3BCLGtEQUEwQjtBQW1CMUIsOERBQThEO0FBQzlELE1BQXFCLGlCQUFpQjtJQUdsQyxvQ0FBb0M7SUFDN0IsUUFBUSxDQUFtQjtJQUNsQyxxREFBcUQ7SUFDOUMsVUFBVSxDQUFpQjtJQUNsQyxrRkFBa0Y7SUFDeEUsZ0JBQWdCLENBQWtDO0lBQzVELGlFQUFpRTtJQUN2RCxRQUFRLENBQStCO0lBQ2pELG9IQUFvSDtJQUMxRyxTQUFTLENBQWM7SUFFakM7OztPQUdHO0lBQ0gsWUFBbUIsTUFBc0IsRUFBRSxRQUEwQjtRQUNqRSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0ksWUFBWSxDQUFDLFNBQW9CO1FBQ3BDLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxPQUFPLFNBQVMsS0FBSyxVQUFVO1lBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBQzlGLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUM1QyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksZUFBZSxDQUFDLFNBQW9CO1FBQ3ZDLElBQUksT0FBTyxTQUFTLEtBQUssVUFBVTtZQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUM5RixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7OztPQUlHO0lBQ08sS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUF3QixFQUFFLFVBQW9CO1FBQ3hFLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQztZQUFFLE9BQU87UUFFM0QsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDbEMsTUFBTSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUU5Qyx5REFBeUQ7UUFDekQsSUFBSSxNQUE4QixDQUFDO1FBQ25DLElBQUksU0FBc0MsQ0FBQztRQUMzQyxJQUFJLFVBQVUsRUFBRTtZQUNaLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsa0JBQWtCO2dCQUFFLE9BQU87WUFDOUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEMsSUFBSSxNQUFNLElBQUksU0FBUyxFQUFFO2dCQUNyQixNQUFNLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUMsaUJBQWlCLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNoRTtTQUNKO2FBQU07WUFDSCxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUM7U0FDaEU7UUFFRCwwQ0FBMEM7UUFDMUMsSUFBSSxTQUFTLEdBQXdDLElBQUksQ0FBQztRQUMxRCxJQUFJLE1BQU0sRUFBRTtZQUNSLGdCQUFnQixFQUFFO2dCQUNkLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDO2dCQUNuQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLFNBQVMsRUFBRTtvQkFDWCxTQUFTLEdBQUcsTUFBTSxTQUFTLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQztvQkFDN0MsTUFBTSxnQkFBZ0IsQ0FBQztpQkFDMUI7Z0JBRUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO29CQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN0QyxTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUNqQixNQUFNLGdCQUFnQixDQUFDO2lCQUMxQjtnQkFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtvQkFDekYsTUFBTSxhQUFhLEdBQUcsSUFBSSx5QkFBWSxFQUFFO3lCQUNuQyxRQUFRLENBQUMsbUJBQU0sQ0FBQyxHQUFHLENBQUM7eUJBQ3BCLGNBQWMsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxJQUFJLHlCQUF5QixDQUFDLENBQUM7b0JBRXBFLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ25ELE1BQU0sZ0JBQWdCLENBQUM7aUJBQzFCO2dCQUVELElBQUksQ0FBQyxVQUFVLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxFQUFFO29CQUNqRCxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQy9CLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVzt3QkFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUN2RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO3dCQUFFLFNBQVMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzFFO2FBQ0o7WUFFRCw2REFBNkQ7WUFDN0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM5QjthQUFNLElBQUksU0FBUyxFQUFFO1lBQ2xCLDZEQUE2RDtZQUM3RCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxrQkFBa0I7Z0JBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDeEQ7UUFFRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVEOzs7T0FHRztJQUNPLEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBZ0M7UUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUM7WUFBRSxPQUFPO1FBRWpELE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsV0FBVyxDQUFDO1FBRXZDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzdCLE1BQU0sYUFBYSxHQUFHLElBQUkseUJBQVksRUFBRTtpQkFDbkMsUUFBUSxDQUFDLG1CQUFNLENBQUMsR0FBRyxDQUFDO2lCQUNwQixjQUFjLENBQUMsU0FBUyxPQUFPLENBQUMsSUFBSSx5QkFBeUIsQ0FBQyxDQUFDO1lBRXBFLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQztnQkFDcEIsTUFBTSxFQUFFLENBQUMsYUFBYSxDQUFDO2dCQUN2QixTQUFTLEVBQUUsSUFBSTthQUNsQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxNQUFNLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLG1CQUFtQixDQUFDLE9BQXdCLEVBQUUsVUFBb0I7UUFDeEUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDaEUsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUUzQixrQ0FBa0M7UUFDbEMsSUFBSSxPQUFPO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDMUIsSUFBSSxNQUFNLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFN0QsNEVBQTRFO1FBQzVFLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRXZELDBEQUEwRDtRQUMxRCxJQUFJLFVBQVUsSUFBSSxPQUFPLEtBQUssVUFBVSxDQUFDLE9BQU87WUFBRSxPQUFPLEtBQUssQ0FBQztRQUUvRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7OztPQUdHO0lBQ08saUJBQWlCLENBQUMsV0FBZ0M7UUFDeEQsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUUxRCxzQkFBc0I7UUFDdEIsSUFBSSxNQUFNLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFN0QscUNBQXFDO1FBQ3JDLElBQUksSUFBSSxLQUFLLDRCQUFlLENBQUMsa0JBQWtCO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDOUQsSUFBSSxXQUFXLEtBQUssbUNBQXNCLENBQUMsU0FBUztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRW5FLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7O09BR0c7SUFDTyxPQUFPLENBQUMsT0FBd0I7UUFDdEMsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDcEMsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7WUFDaEMsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pDLElBQUksT0FBTyxFQUFFO2dCQUNULElBQUksT0FBTyxPQUFPLEtBQUssUUFBUTtvQkFBRSxPQUFPLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztnQkFFL0UsTUFBTSxLQUFLLEdBQUcsT0FBTyxPQUFPLENBQUMsTUFBTSxLQUFLLFFBQVE7dUJBQ3pDLENBQ0MsY0FBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDOzJCQUM3QixjQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FDdEMsQ0FBQztnQkFDTixJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNSLE1BQU0sSUFBSSxTQUFTLENBQ2YsY0FBYyxTQUFTLENBQUMsSUFBSSxtRUFBbUUsQ0FDbEcsQ0FBQztpQkFDTDtnQkFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQTRCLENBQUMsQ0FBQztnQkFDM0UsT0FBTyxPQUFPLENBQUM7YUFDbEI7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDTyxvQkFBb0IsQ0FDMUIsT0FBd0IsRUFDeEIsVUFBK0IsRUFDL0IsTUFBOEIsRUFDOUIsU0FBa0M7UUFFbEMsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDbEMsTUFBTSxFQUFFLHVCQUF1QixFQUFFLGtCQUFrQixFQUFFLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUN2RSxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRXZCLElBQUksQ0FBQyx1QkFBdUIsSUFBSSx1QkFBdUIsSUFBSSxDQUFDO1lBQUUsT0FBTztRQUNyRSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsa0JBQWtCO1lBQUUsT0FBTztRQUMzQyxJQUFJLFNBQVMsS0FBSyxJQUFJLElBQUksTUFBTSxFQUFFO1lBQzlCLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2IsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDWixRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QixDQUFDLEVBQUUsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLENBQUM7YUFDdEM7WUFDRCxPQUFPO1NBQ1Y7UUFDRCxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7O09BR0c7SUFDTyxZQUFZLENBQUMsT0FBd0I7UUFDM0MsTUFBTSxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDcEQsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFbkMsc0NBQXNDO1FBQ3RDLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVE7Z0JBQUUsU0FBUztZQUNoQyxLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RDLGdFQUFnRTtnQkFDaEUsSUFBSSxPQUFPO29CQUFFLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ25FO1NBQ0o7UUFFRCx3REFBd0Q7UUFDeEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxFQUFFLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakYsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLO1lBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEYsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNPLFlBQVksQ0FDbEIsT0FBd0IsRUFBRSxPQUFlLEVBQUUsZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxLQUFLO1FBRW5GLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDNUIsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUUxQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDMUIsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTtZQUN2RCxnRUFBZ0U7WUFDaEUsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNoRztRQUNELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRixnRUFBZ0U7UUFDaEUsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVEOzs7T0FHRztJQUNPLG1CQUFtQixDQUFDLE1BQWU7UUFDekMsTUFBTSxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQztRQUMxQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUksTUFBK0IsQ0FBQyxJQUFJLENBQUM7UUFFckQsSUFBSSxPQUFlLENBQUM7UUFDcEIsSUFBSSxNQUFNLEVBQUU7WUFDUixNQUFNLGFBQWEsR0FBRyxjQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FDaEIsU0FBUyxFQUFFLFdBQVcsYUFBYSxVQUFVLGFBQWEsZ0JBQWdCLEVBQUUsR0FBRyxDQUNsRixDQUFDO1NBQ0w7YUFBTTtZQUNILE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDM0Q7UUFDRCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHFDQUFxQyxNQUFNLE1BQU0sT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNqRixPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0o7QUF0VUQsb0NBc1VDIn0=