import { Message, CommandInteraction, GuildMember, TextBasedChannel } from 'discord.js';
import CommandoClient from './client';
import CommandoGuild from './extensions/guild';
import CommandoMessage, { CommandoMessageResponse } from './extensions/message';
import CommandoRegistry from './registry';
interface Inhibition {
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
declare type Inhibitor = (msg: CommandoMessage) => Inhibition | boolean | string;
declare class CommandoMember extends GuildMember {
    guild: CommandoGuild;
}
export declare class CommandoInteraction extends CommandInteraction {
    client: CommandoClient;
    guild: CommandoGuild | null;
    member: CommandoMember | null;
    channel: TextBasedChannel;
}
/** Handles parsing messages and running commands from them */
export default class CommandDispatcher {
    /** Client this dispatcher handles messages for */
    readonly client: CommandoClient;
    /** Registry this dispatcher uses */
    registry: CommandoRegistry;
    /** Functions that can block commands from running */
    inhibitors: Set<Inhibitor>;
    /** Map of {@link RegExp}s that match command messages, mapped by string prefix */
    protected _commandPatterns: Map<string, RegExp>;
    /** Old command message results, mapped by original message ID */
    protected _results: Map<string, CommandoMessage>;
    /** Tuples in string form of user ID and channel ID that are currently awaiting messages from a user in a channel */
    protected _awaiting: Set<string>;
    /**
     * @param client - Client the dispatcher is for
     * @param registry - Registry the dispatcher will use
     */
    constructor(client: CommandoClient, registry: CommandoRegistry);
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
    addInhibitor(inhibitor: Inhibitor): boolean;
    /**
     * Removes an inhibitor
     * @param inhibitor - The inhibitor function to remove
     * @return Whether the removal was successful
     */
    removeInhibitor(inhibitor: Inhibitor): boolean;
    /**
     * Handle a new message or a message update
     * @param message - The message to handle
     * @param oldMessage - The old message before the update
     */
    protected handleMessage(message: CommandoMessage, oldMessage?: Message): Promise<void>;
    /**
     * Handle a slash command interaction
     * @param interaction - The interaction to handle
     */
    protected handleSlash(interaction: CommandoInteraction): Promise<unknown>;
    /**
     * Check whether a message should be handled
     * @param message - The message to handle
     * @param oldMessage - The old message before the update
     */
    protected shouldHandleMessage(message: CommandoMessage, oldMessage?: Message): boolean;
    /**
     * Inhibits a command message
     * @param {CommandoMessage} cmdMsg - Command message to inhibit
     */
    protected inhibit(cmdMsg: CommandoMessage): Inhibition | null;
    /**
     * Caches a command message to be editable
     * @param message - Triggering message
     * @param oldMessage - Triggering message's old version
     * @param cmdMsg - Command message to cache
     * @param responses - Responses to the message
     */
    protected cacheCommandoMessage(message: CommandoMessage, oldMessage: Message | undefined, cmdMsg: CommandoMessage | null, responses: CommandoMessageResponse): void;
    /**
     * Parses a message to find details about command usage in it
     * @param message - The message
     */
    protected parseMessage(message: CommandoMessage): CommandoMessage | null;
    /**
     * Matches a message against a guild command pattern
     * @param message - The message
     * @param pattern - The pattern to match against
     * @param commandNameIndex - The index of the command name in the pattern matches
     * @param prefixless - Whether the match is happening for a prefixless usage
     */
    protected matchDefault(message: CommandoMessage, pattern: RegExp, commandNameIndex?: number, prefixless?: boolean): CommandoMessage | null;
    /**
     * Creates a regular expression to match the command prefix and name in a message
     * @param prefix - Prefix to build the pattern for
     */
    protected buildCommandPattern(prefix?: string): RegExp;
}
export {};
