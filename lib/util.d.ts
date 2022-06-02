import { Message, MessageOptions } from 'discord.js';
export declare function escapeRegex(str: string): string;
export declare function probability(n: number): boolean;
export declare function isPromise<T, S>(obj: PromiseLike<T> | S): obj is PromiseLike<T>;
export declare function noReplyInDMs(msg: Message): MessageOptions;
export declare function disambiguation(items: (string | Record<string, string>)[], label: string, property?: string | null): string;
/**
 * @param str - The string to parse
 */
export declare function removeDashes(str: string): string;
export declare const permissions: {
    CREATE_INSTANT_INVITE: string;
    KICK_MEMBERS: string;
    BAN_MEMBERS: string;
    ADMINISTRATOR: string;
    MANAGE_CHANNELS: string;
    MANAGE_GUILD: string;
    ADD_REACTIONS: string;
    VIEW_AUDIT_LOG: string;
    PRIORITY_SPEAKER: string;
    STREAM: string;
    VIEW_CHANNEL: string;
    SEND_MESSAGES: string;
    SEND_TTS_MESSAGES: string;
    MANAGE_MESSAGES: string;
    EMBED_LINKS: string;
    ATTACH_FILES: string;
    READ_MESSAGE_HISTORY: string;
    MENTION_EVERYONE: string;
    USE_EXTERNAL_EMOJIS: string;
    VIEW_GUILD_INSIGHTS: string;
    CONNECT: string;
    SPEAK: string;
    MUTE_MEMBERS: string;
    DEAFEN_MEMBERS: string;
    MOVE_MEMBERS: string;
    USE_VAD: string;
    CHANGE_NICKNAME: string;
    MANAGE_NICKNAMES: string;
    MANAGE_ROLES: string;
    MANAGE_WEBHOOKS: string;
    MANAGE_EMOJIS_AND_STICKERS: string;
    USE_APPLICATION_COMMANDS: string;
    REQUEST_TO_SPEAK: string;
    MANAGE_EVENTS: string;
    MANAGE_THREADS: string;
    /** @deprecated This will be removed in discord.js v14 */
    USE_PUBLIC_THREADS: string;
    CREATE_PUBLIC_THREADS: string;
    /** @deprecated This will be removed in discord.js v14 */
    USE_PRIVATE_THREADS: string;
    CREATE_PRIVATE_THREADS: string;
    USE_EXTERNAL_STICKERS: string;
    SEND_MESSAGES_IN_THREADS: string;
    START_EMBEDDED_ACTIVITIES: string;
    MODERATE_MEMBERS: string;
};
