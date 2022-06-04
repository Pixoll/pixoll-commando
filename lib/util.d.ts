import { Message, MessageOptions } from 'discord.js';
import CommandoMessage from './extensions/message';
/** Options for splitting a message */
export interface SplitOptions {
    /**
     * Maximum character length per message piece.
     * @default 2000
     */
    maxLength?: number;
    /**
     * Character(s) or Regex(es) to split the message with, an array can be used to split multiple times.
     * @default '\n'
     */
    char?: string | string[] | RegExp | RegExp[];
    /** Text to prepend to every piece except the first. */
    prepend?: string;
    /** Text to append to every piece except the last. */
    append?: string;
}
/** Contains various general-purpose utility methods and constants. */
export default class Util extends null {
    /** Object that maps every PermissionString to its representation inside the Discord client. */
    static get permissions(): {
        readonly CREATE_INSTANT_INVITE: "Create instant invite";
        readonly KICK_MEMBERS: "Kick members";
        readonly BAN_MEMBERS: "Ban members";
        readonly ADMINISTRATOR: "Administrator";
        readonly MANAGE_CHANNELS: "Manage channels";
        readonly MANAGE_GUILD: "Manage server";
        readonly ADD_REACTIONS: "Add reactions";
        readonly VIEW_AUDIT_LOG: "View audit log";
        readonly PRIORITY_SPEAKER: "Priority speaker";
        readonly STREAM: "Video";
        readonly VIEW_CHANNEL: "View channels";
        readonly SEND_MESSAGES: "Send messages";
        readonly SEND_TTS_MESSAGES: "Send TTS messages";
        readonly MANAGE_MESSAGES: "Manage messages";
        readonly EMBED_LINKS: "Embed links";
        readonly ATTACH_FILES: "Attach files";
        readonly READ_MESSAGE_HISTORY: "Read message history";
        readonly MENTION_EVERYONE: "Mention everyone";
        readonly USE_EXTERNAL_EMOJIS: "Use external emojis";
        readonly VIEW_GUILD_INSIGHTS: "View server insights";
        readonly CONNECT: "Connect";
        readonly SPEAK: "Speak";
        readonly MUTE_MEMBERS: "Mute members";
        readonly DEAFEN_MEMBERS: "Deafen members";
        readonly MOVE_MEMBERS: "Move members";
        readonly USE_VAD: "Use voice activity";
        readonly CHANGE_NICKNAME: "Change nickname";
        readonly MANAGE_NICKNAMES: "Manage nicknames";
        readonly MANAGE_ROLES: "Manage roles";
        readonly MANAGE_WEBHOOKS: "Manage webhooks";
        readonly MANAGE_EMOJIS_AND_STICKERS: "Manage emojis and stickers";
        readonly USE_APPLICATION_COMMANDS: "Use application commands";
        readonly REQUEST_TO_SPEAK: "Request to speak";
        readonly MANAGE_EVENTS: "Manage events";
        readonly MANAGE_THREADS: "Manage threads";
        /** @deprecated This will be removed in discord.js v14 */
        readonly USE_PUBLIC_THREADS: "Use public threads";
        readonly CREATE_PUBLIC_THREADS: "Create public threads";
        /** @deprecated This will be removed in discord.js v14 */
        readonly USE_PRIVATE_THREADS: "Use private threads";
        readonly CREATE_PRIVATE_THREADS: "Create private threads";
        readonly USE_EXTERNAL_STICKERS: "Use external stickers";
        readonly SEND_MESSAGES_IN_THREADS: "Send messages in threads";
        readonly START_EMBEDDED_ACTIVITIES: "Start activities";
        readonly MODERATE_MEMBERS: "Time out members";
    };
    /**
     * Escapes the following characters from a string: `|\{}()[]^$+*?.`.
     * @param str - The string to escape.
     */
    static escapeRegex(str: string): string;
    /**
     * Basic probability function.
     * @param n - The probability percentage, from 0 to 100.
     */
    static probability(n: number): boolean;
    /**
     * Checks if the argument is a promise.
     * @param obj - The object of function to check.
     */
    static isPromise<T, S>(obj: PromiseLike<T> | S): obj is PromiseLike<T>;
    /**
     * Removes the reply ping from a message if its sent in DMs.
     * @param msg - The message instance.
     * @returns A {@link MessageOptions} object.
     */
    static noReplyPingInDMs(msg: Message | CommandoMessage): MessageOptions;
    /**
     * Disambiguate items from an array into a list.
     * @param items - An array of strings or objects.
     * @param label - The label for the items list.
     * @param property - The property to read from the objects (only usable if `items` is an array of objects).
     * @returns A string with the disambiguated items.
     */
    static disambiguation(items: (string | Record<string, string>)[], label: string, property?: string): string;
    /**
     * Removes the dashes from a string and capitalizes the characters in front of them.
     * @param str - The string to parse.
     */
    static removeDashes(str: string): string;
    /**
     * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
     * @param text - Content to split
     * @param options Options controlling the behavior of the split
     */
    static splitMessage(text: string, options?: SplitOptions): string[];
    /**
     * Verifies the provided data is a string, otherwise throws provided error.
     * @param data The string resolvable to resolve
     * @param error The Error constructor to instantiate. Defaults to Error
     * @param errorMessage The error message to throw with. Defaults to "Expected string, got <data> instead."
     * @param allowEmpty Whether an empty string should be allowed
     */
    protected static verifyString(data: string, error?: ErrorConstructor, errorMessage?: string, allowEmpty?: boolean): string;
}
