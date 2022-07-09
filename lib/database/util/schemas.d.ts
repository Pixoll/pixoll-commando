import { Snowflake } from 'discord.js';
import { Model, FilterQuery } from 'mongoose';
export interface DataModel<T> extends Model<T> {
    find(filter: FilterQuery<T>): Promise<T[]>;
    findOne(filter: FilterQuery<T>): Promise<T>;
    findById(id: string): Promise<T>;
    updateOne(filter: FilterQuery<T>): Promise<T>;
}
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
    type: TimeBasedModeration | 'ban' | 'kick' | 'soft-ban' | 'warn';
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
    type: 'bedrock' | 'java';
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
    emojis: Array<Snowflake | string>;
    duration: number;
}
export interface ReactionRoleSchema extends BaseSchema {
    guild: Snowflake;
    channel: Snowflake;
    message: Snowflake;
    roles: Snowflake[];
    emojis: Array<Snowflake | string>;
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
export declare const active: DataModel<ActiveSchema>;
export declare const afk: DataModel<AfkSchema>;
export declare const disabled: DataModel<DisabledSchema>;
export declare const errors: DataModel<ErrorSchema>;
export declare const faq: DataModel<FaqSchema>;
export declare const mcIp: DataModel<McIpSchema>;
export declare const moderations: DataModel<ModerationSchema>;
export declare const modules: DataModel<ModuleSchema>;
export declare const prefixes: DataModel<PrefixSchema>;
export declare const polls: DataModel<PollSchema>;
export declare const reactionRoles: DataModel<ReactionRoleSchema>;
export declare const reminders: DataModel<ReminderSchema>;
export declare const rules: DataModel<RuleSchema>;
export declare const setup: DataModel<SetupSchema>;
export declare const stickyRoles: DataModel<StickyRoleSchema>;
export declare const todo: DataModel<TodoSchema>;
export declare const welcome: DataModel<WelcomeSchema>;
export interface Schemas {
    active: DataModel<ActiveSchema>;
    afk: DataModel<AfkSchema>;
    disabled: DataModel<DisabledSchema>;
    errors: DataModel<ErrorSchema>;
    faq: DataModel<FaqSchema>;
    mcIp: DataModel<McIpSchema>;
    moderations: DataModel<ModerationSchema>;
    modules: DataModel<ModuleSchema>;
    polls: DataModel<PollSchema>;
    prefixes: DataModel<PrefixSchema>;
    reactionRoles: DataModel<ReactionRoleSchema>;
    reminders: DataModel<ReminderSchema>;
    rules: DataModel<RuleSchema>;
    setup: DataModel<SetupSchema>;
    stickyRoles: DataModel<StickyRoleSchema>;
    todo: DataModel<TodoSchema>;
    welcome: DataModel<WelcomeSchema>;
}
declare const _default: {
    active: DataModel<ActiveSchema>;
    afk: DataModel<AfkSchema>;
    disabled: DataModel<DisabledSchema>;
    errors: DataModel<ErrorSchema>;
    faq: DataModel<FaqSchema>;
    mcIp: DataModel<McIpSchema>;
    moderations: DataModel<ModerationSchema>;
    modules: DataModel<ModuleSchema>;
    polls: DataModel<PollSchema>;
    prefixes: DataModel<PrefixSchema>;
    reactionRoles: DataModel<ReactionRoleSchema>;
    reminders: DataModel<ReminderSchema>;
    rules: DataModel<RuleSchema>;
    setup: DataModel<SetupSchema>;
    stickyRoles: DataModel<StickyRoleSchema>;
    todo: DataModel<TodoSchema>;
    welcome: DataModel<WelcomeSchema>;
};
export default _default;
