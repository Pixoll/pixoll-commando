/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indizes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose" />
import { Snowflake } from 'discord.js';
export declare const active: import("mongoose").Model<any, {}, {}, {}>;
export declare const afk: import("mongoose").Model<any, {}, {}, {}>;
export declare const disabled: import("mongoose").Model<any, {}, {}, {}>;
export declare const errors: import("mongoose").Model<any, {}, {}, {}>;
export declare const faq: import("mongoose").Model<any, {}, {}, {}>;
export declare const mcIp: import("mongoose").Model<any, {}, {}, {}>;
export declare const moderations: import("mongoose").Model<any, {}, {}, {}>;
export declare const modules: import("mongoose").Model<any, {}, {}, {}>;
export declare const prefixes: import("mongoose").Model<any, {}, {}, {}>;
export declare const polls: import("mongoose").Model<any, {}, {}, {}>;
export declare const reactionRoles: import("mongoose").Model<any, {}, {}, {}>;
export declare const reminders: import("mongoose").Model<any, {}, {}, {}>;
export declare const rules: import("mongoose").Model<any, {}, {}, {}>;
export declare const setup: import("mongoose").Model<any, {}, {}, {}>;
export declare const stickyRoles: import("mongoose").Model<any, {}, {}, {}>;
export declare const todo: import("mongoose").Model<any, {}, {}, {}>;
export declare const welcome: import("mongoose").Model<any, {}, {}, {}>;
interface BaseSchema {
    readonly _id: string;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}
declare type TimeBasedModeration = 'mute' | 'temp-ban' | 'time-out';
export interface ActiveSchema extends BaseSchema {
    type: TimeBasedModeration | 'temp-role';
    guild: Snowflake;
    userId: Snowflake;
    userTag: string;
    role: Snowflake;
    duration: number;
}
export interface AfkSchema extends BaseSchema {
    guild: Snowflake;
    user: Snowflake;
    status: string;
}
export interface DisabledSchema extends BaseSchema {
    guild?: Snowflake;
    global: boolean;
    commands: string[];
    groups: string[];
}
export interface ErrorSchema extends BaseSchema {
    type: string;
    name: string;
    message: string;
    command: string;
    files: string;
}
export interface FaqSchema extends BaseSchema {
    question: string;
    answer: string;
}
export interface ModerationSchema extends BaseSchema {
    type: 'warn' | 'ban' | 'kick' | 'soft-ban' | TimeBasedModeration;
    guild: Snowflake;
    userId: Snowflake;
    userTag: string;
    modId: Snowflake;
    modTag: string;
    reason: string;
    duration: string;
}
export interface McIpSchema extends BaseSchema {
    guild: Snowflake;
    type: 'java' | 'bedrock';
    ip: string;
    port: number;
}
export interface ModuleSchema extends BaseSchema {
    guild: Snowflake;
    stickyRoles: boolean;
    welcome: boolean;
    auditLogs: {
        boosts: boolean;
        channels: boolean;
        commands: boolean;
        emojis: boolean;
        events: boolean;
        invites: boolean;
        members: boolean;
        messages: boolean;
        moderation: boolean;
        modules: boolean;
        roles: boolean;
        server: boolean;
        stickers: boolean;
        threads: boolean;
        users: boolean;
        voice: boolean;
    };
}
export interface PrefixSchema extends BaseSchema {
    global: boolean;
    guild?: Snowflake;
    prefix: string;
}
export interface PollSchema extends BaseSchema {
    guild: Snowflake;
    channel: Snowflake;
    message: Snowflake;
    emojis: (string | Snowflake)[];
    duration: number;
}
export interface ReactionRoleSchema extends BaseSchema {
    guild: Snowflake;
    channel: Snowflake;
    message: Snowflake;
    roles: Snowflake[];
    emojis: (string | Snowflake)[];
}
export interface ReminderSchema extends BaseSchema {
    user: Snowflake;
    reminder: string;
    remindAt: number;
    message: Snowflake;
    msgURL: string;
    channel: Snowflake;
}
export interface RuleSchema extends BaseSchema {
    guild: Snowflake;
    rules: string[];
}
export interface SetupSchema extends BaseSchema {
    guild: Snowflake;
    logsChannel: Snowflake;
    memberRole: Snowflake;
    botRole: Snowflake;
    mutedRole: Snowflake;
    lockChannels: Snowflake[];
}
export interface StickyRoleSchema extends BaseSchema {
    guild: Snowflake;
    user: Snowflake;
    roles: Snowflake[];
}
export interface TodoSchema extends BaseSchema {
    user: Snowflake;
    list: string[];
}
export interface WelcomeSchema extends BaseSchema {
    guild: Snowflake;
    channel: Snowflake;
    message: string;
}
export {};
