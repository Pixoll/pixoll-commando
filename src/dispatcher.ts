import { EmbedBuilder, Message, Colors } from 'discord.js';
import CommandoClient from './client';
import { ArgumentResponse } from './commands/argument';
import { CommandBlockReason } from './commands/base';
import { CommandoChatInputCommandInteraction, CommandoifiedInteraction } from './discord.overrides';
import CommandoInteraction from './extensions/interaction';
import CommandoMessage, { CommandoMessageResponse } from './extensions/message';
import CommandoRegistry from './registry';
import Util from './util';

export interface Inhibition {
    /** Identifier for the reason the command is being blocked */
    reason: string;
    /** Response being sent to the user */
    response?: Promise<Message> | null;
}

/**
 * A function that decides whether the usage of a command should be blocked
 * @param msg - Message triggering the command
 * @returns `false` if the command should *not* be blocked.
 * If the command *should* be blocked, then one of the following:
 * - A single string identifying the reason the command is blocked
 * - An Inhibition object
 */
type Inhibitor = (msg: CommandoMessage) => Inhibition | string;

type UsableInteraction =
    | CommandoInteraction
    | Exclude<CommandoifiedInteraction, CommandoChatInputCommandInteraction>;

/** Handles parsing messages and running commands from them */
export default class CommandDispatcher {
    /** Client this dispatcher handles messages for */
    declare public readonly client: CommandoClient;
    /** Registry this dispatcher uses */
    public registry: CommandoRegistry;
    /** Functions that can block commands from running */
    public inhibitors: Set<Inhibitor>;
    /** Map of {@link RegExp}s that match command messages, mapped by string prefix */
    protected _commandPatterns: Map<string | undefined, RegExp>;
    /** Old command message results, mapped by original message ID */
    protected _results: Map<string, CommandoMessage>;
    /** Tuples in string form of user ID and channel ID that are currently awaiting messages from a user in a channel */
    protected _awaiting: Set<string>;

    /**
     * @param client - Client the dispatcher is for
     * @param registry - Registry the dispatcher will use
     */
    public constructor(client: CommandoClient, registry: CommandoRegistry) {
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
    public addInhibitor(inhibitor: Inhibitor): boolean {
        const { inhibitors } = this;
        if (typeof inhibitor !== 'function') throw new TypeError('The inhibitor must be a function.');
        if (inhibitors.has(inhibitor)) return false;
        inhibitors.add(inhibitor);
        return true;
    }

    /**
     * Removes an inhibitor
     * @param inhibitor - The inhibitor function to remove
     * @return Whether the removal was successful
     */
    public removeInhibitor(inhibitor: Inhibitor): boolean {
        if (typeof inhibitor !== 'function') throw new TypeError('The inhibitor must be a function.');
        return this.inhibitors.delete(inhibitor);
    }

    /**
     * Handle a new message or a message update
     * @param message - The message to handle
     * @param oldMessage - The old message before the update
     */
    protected async handleMessage(message: CommandoMessage, oldMessage?: Message): Promise<void> {
        if (!this.shouldHandleMessage(message, oldMessage)) return;

        const { client, _results } = this;
        const { nonCommandEditable } = client.options;

        // Parse the message, and get the old result if it exists
        let cmdMsg: CommandoMessage | null;
        let oldCmdMsg: CommandoMessage | undefined;
        if (oldMessage) {
            oldCmdMsg = _results.get(oldMessage.id);
            if (!oldCmdMsg && !nonCommandEditable) return;
            cmdMsg = this.parseMessage(message);
            if (cmdMsg && oldCmdMsg) {
                cmdMsg.responses = oldCmdMsg.responses;
                cmdMsg.responsePositions = oldCmdMsg.responsePositions;
                this.client.emit('commandoMessageUpdate', oldCmdMsg, cmdMsg);
            }
        } else {
            cmdMsg = this.parseMessage(message);
            this.client.emit('commandoMessageCreate', cmdMsg ?? message);
        }

        // Run the command, or reply with an error
        let responses: ArgumentResponse | Message[] | null = null;
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
                    const responseEmbed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(`The \`${command.name}\` command is disabled.`);

                    responses = await cmdMsg.replyEmbed(responseEmbed);
                    break commandResponses;
                }

                if (!oldMessage || typeof oldCmdMsg !== 'undefined') {
                    responses = await cmdMsg.run();
                    if (typeof responses === 'undefined') responses = null;
                    if (Array.isArray(responses)) responses = await Promise.all(responses);
                }
            }

            // @ts-expect-error: finalize is protected in CommandoMessage
            cmdMsg.finalize(responses);
        } else if (oldCmdMsg) {
            // @ts-expect-error: finalize is protected in CommandoMessage
            oldCmdMsg.finalize(null);
            if (!nonCommandEditable) _results.delete(message.id);
        }

        this.cacheCommandoMessage(message, oldMessage, cmdMsg, responses);
    }

    /**
     * Handle a new interaction
     * @param interaction - The interaction to handle
     */
    protected async handleInteraction(interaction: UsableInteraction): Promise<void> {
        if (interaction.isChatInputCommand()) {
            await this.handleChatInputCommand(interaction);
            return;
        }

        if (!interaction.isAutocomplete() && !interaction.isContextMenuCommand()) return;

        const { client, commandName } = interaction;
        const command = client.registry.resolveCommand(commandName);
        if (interaction.isAutocomplete()) {
            if (!command.runAutocomplete) return;
            await command.runAutocomplete(interaction);
            return;
        }

        if (interaction.isMessageContextMenuCommand()) {
            if (!command.runMessageContextMenu) return;
            await command.runMessageContextMenu(interaction);
            return;
        }

        if (interaction.isUserContextMenuCommand()) {
            if (!command.runUserContextMenu) return;
            await command.runUserContextMenu(interaction);
            return;
        }
    }

    /**
     * Handle a new slash command interaction
     * @param interaction - The interaction to handle
     */
    protected async handleChatInputCommand(interaction: CommandoInteraction): Promise<void> {
        const { command, guild } = interaction;

        if (!command.isEnabledIn(guild)) {
            const responseEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
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
    protected shouldHandleMessage(message: CommandoMessage, oldMessage?: Message): boolean {
        const { partial, author, channelId, content, client } = message;
        const { _awaiting } = this;

        // Ignore partial and bot messages
        if (partial) return false;
        if (author.bot || author.id === client.user.id) return false;

        // Ignore messages from users that the bot is already waiting for input from
        if (_awaiting.has(author.id + channelId)) return false;

        // Make sure the edit actually changed the message content
        if (oldMessage && content === oldMessage.content) return false;

        return true;
    }

    /**
     * Inhibits a command message
     * @param message - Command message to inhibit
     */
    protected inhibit(message: CommandoMessage): Inhibition | null {
        const { inhibitors, client } = this;
        for (const inhibitor of inhibitors) {
            let inhibit = inhibitor(message);
            if (!inhibit) continue;
            if (typeof inhibit !== 'object') inhibit = { reason: inhibit, response: null };

            const valid = typeof inhibit.reason === 'string' && (
                Util.isNullish(inhibit.response)
                || Util.isPromise(inhibit.response)
            );
            if (!valid) throw new TypeError(
                `Inhibitor "${inhibitor.name}" had an invalid result must be a string or an Inhibition object.`
            );

            client.emit('commandBlock', message, inhibit.reason as CommandBlockReason);
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
    protected cacheCommandoMessage(
        message: CommandoMessage,
        oldMessage: Message | undefined,
        cmdMsg: CommandoMessage | null,
        responses: CommandoMessageResponse
    ): void {
        const { client, _results } = this;
        const { commandEditableDuration, nonCommandEditable } = client.options;
        const { id } = message;

        if (!commandEditableDuration || commandEditableDuration <= 0) return;
        if (!cmdMsg && !nonCommandEditable) return;
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
    protected parseMessage(message: CommandoMessage): CommandoMessage | null {
        const { client, _commandPatterns, registry } = this;
        const { content, guild } = message;

        // Find the command to run by patterns
        for (const command of registry.commands.values()) {
            if (!command.patterns) continue;
            for (const pattern of command.patterns) {
                const matches = pattern.exec(content);
                // @ts-expect-error: initCommand is protected in CommandoMessage
                if (matches) return message.initCommand(command, null, matches);
            }
        }

        // Find the command to run with default command handling
        const prefix = guild?.prefix || client.prefix;
        const pattern = _commandPatterns.get(prefix) ?? this.buildCommandPattern(prefix);
        let cmdMsg = this.matchDefault(message, pattern, 2);
        if (!cmdMsg && !guild) cmdMsg = this.matchDefault(message, /^([^\s]+)/i, 1, true);
        return cmdMsg;
    }

    /**
     * Matches a message against a guild command pattern
     * @param message - The message
     * @param pattern - The pattern to match against
     * @param commandNameIndex - The index of the command name in the pattern matches
     * @param prefixless - Whether the match is happening for a prefixless usage
     */
    protected matchDefault(
        message: CommandoMessage, pattern: RegExp, commandNameIndex = 1, prefixless = false
    ): CommandoMessage | null {
        const { content } = message;
        const { registry } = this;

        const matches = pattern.exec(content);
        if (!matches) return null;
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
    protected buildCommandPattern(prefix?: string): RegExp {
        const { client, _commandPatterns } = this;
        const { id } = (client as CommandoClient<true>).user;

        let pattern: RegExp;
        if (prefix) {
            const escapedPrefix = Util.escapeRegex(prefix);
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
