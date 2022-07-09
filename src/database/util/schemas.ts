import { Snowflake } from 'discord.js';
import { model, Schema, Model, FilterQuery } from 'mongoose';

// @ts-expect-error: incompatible methods between interfaces
export interface DataModel<T> extends Model<T> {
    find(filter: FilterQuery<T>): Promise<T[]>
    findOne(filter: FilterQuery<T>): Promise<T>
    findById(id: string): Promise<T>
    updateOne(filter: FilterQuery<T>): Promise<T>
}

interface BaseSchema { // extends Document
    readonly _id: string
    readonly createdAt?: Date
    readonly updatedAt?: Date
}

type TimeBasedModeration = 'mute' | 'temp-ban' | 'time-out'

export interface ActiveSchema extends BaseSchema {
    type: TimeBasedModeration | 'temp-role'
    guild: Snowflake
    userId: Snowflake
    userTag: string
    role: Snowflake
    duration: number
}

export interface AfkSchema extends BaseSchema {
    guild: Snowflake
    user: Snowflake
    status: string
}

export interface DisabledSchema extends BaseSchema {
    guild?: Snowflake
    global: boolean
    commands: string[]
    groups: string[]
}

export interface ErrorSchema extends BaseSchema {
    type: string
    name: string
    message: string
    command: string
    files: string
}

export interface FaqSchema extends BaseSchema {
    question: string
    answer: string
}

export interface ModerationSchema extends BaseSchema {
    type: TimeBasedModeration | 'ban' | 'kick' | 'soft-ban' | 'warn'
    guild: Snowflake
    userId: Snowflake
    userTag: string
    modId: Snowflake
    modTag: string
    reason: string
    duration: string
}

export interface McIpSchema extends BaseSchema {
    guild: Snowflake
    type: 'bedrock' | 'java'
    ip: string
    port: number
}

export interface ModuleSchema extends BaseSchema {
    guild: Snowflake
    // chatFilter: boolean
    // scamDetector: boolean
    stickyRoles: boolean
    welcome: boolean
    auditLogs: {
        boosts: boolean
        channels: boolean
        commands: boolean
        emojis: boolean
        events: boolean
        invites: boolean
        members: boolean
        messages: boolean
        moderation: boolean
        modules: boolean
        roles: boolean
        server: boolean
        stickers: boolean
        threads: boolean
        users: boolean
        voice: boolean
    }
}

export interface PrefixSchema extends BaseSchema {
    global: boolean
    guild?: Snowflake
    prefix: string
}

export interface PollSchema extends BaseSchema {
    guild: Snowflake
    channel: Snowflake
    message: Snowflake
    emojis: Array<Snowflake | string>
    duration: number
}

export interface ReactionRoleSchema extends BaseSchema {
    guild: Snowflake
    channel: Snowflake
    message: Snowflake
    roles: Snowflake[]
    emojis: Array<Snowflake | string>
}

export interface ReminderSchema extends BaseSchema {
    user: Snowflake
    reminder: string
    remindAt: number
    message: Snowflake
    msgURL: string
    channel: Snowflake
}

export interface RuleSchema extends BaseSchema {
    guild: Snowflake
    rules: string[]
}

export interface SetupSchema extends BaseSchema {
    guild: Snowflake
    logsChannel: Snowflake
    memberRole: Snowflake
    botRole: Snowflake
    mutedRole: Snowflake
    lockChannels: Snowflake[]
}

export interface StickyRoleSchema extends BaseSchema {
    guild: Snowflake
    user: Snowflake
    roles: Snowflake[]
}

export interface TodoSchema extends BaseSchema {
    user: Snowflake
    list: string[]
}

export interface WelcomeSchema extends BaseSchema {
    guild: Snowflake
    channel: Snowflake
    message: string
}

// @ts-expect-error: incompatible methods between interfaces
export const active: DataModel<ActiveSchema> = model('active', new Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    role: String,
    duration: Number
}, { timestamps: true }), 'active');

// @ts-expect-error: incompatible methods between interfaces
export const afk: DataModel<AfkSchema> = model('afk', new Schema({
    guild: String,
    user: String,
    status: String
}, { timestamps: true }), 'afk');

// @ts-expect-error: incompatible methods between interfaces
export const disabled: DataModel<DisabledSchema> = model('disabled', new Schema({
    guild: String,
    global: Boolean,
    commands: Array,
    groups: Array
}), 'disabled');

// @ts-expect-error: incompatible methods between interfaces
export const errors: DataModel<ErrorSchema> = model('errors', new Schema({
    _id: String,
    type: String,
    name: String,
    message: String,
    command: String,
    files: String,
}, { timestamps: true }));

// @ts-expect-error: incompatible methods between interfaces
export const faq: DataModel<FaqSchema> = model('faq', new Schema({
    question: String,
    answer: String
}), 'faq');

// @ts-expect-error: incompatible methods between interfaces
export const mcIp: DataModel<McIpSchema> = model('mc-ips', new Schema({
    guild: String,
    type: String,
    ip: String,
    port: Number
}));

// @ts-expect-error: incompatible methods between interfaces
export const moderations: DataModel<ModerationSchema> = model('moderations', new Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    modId: String,
    modTag: String,
    reason: String,
    duration: String
}, { timestamps: true }));

// @ts-expect-error: incompatible methods between interfaces
export const modules: DataModel<ModuleSchema> = model('modules', new Schema({
    guild: String,
    // chatFilter: Boolean,
    // scamDetector: Boolean,
    stickyRoles: Boolean,
    welcome: Boolean,
    auditLogs: {
        boosts: Boolean,
        channels: Boolean,
        commands: Boolean,
        emojis: Boolean,
        events: Boolean,
        invites: Boolean,
        members: Boolean,
        messages: Boolean,
        moderation: Boolean,
        modules: Boolean,
        roles: Boolean,
        server: Boolean,
        stickers: Boolean,
        threads: Boolean,
        users: Boolean,
        voice: Boolean
    }
}));

// @ts-expect-error: incompatible methods between interfaces
export const prefixes: DataModel<PrefixSchema> = model('prefixes', new Schema({
    global: Boolean,
    guild: String,
    prefix: String
}));

// @ts-expect-error: incompatible methods between interfaces
export const polls: DataModel<PollSchema> = model('polls', new Schema({
    guild: String,
    channel: String,
    message: String,
    emojis: Array,
    duration: Number
}));

// @ts-expect-error: incompatible methods between interfaces
export const reactionRoles: DataModel<ReactionRoleSchema> = model('reaction-roles', new Schema({
    guild: String,
    channel: String,
    message: String,
    roles: Array,
    emojis: Array
}));

// @ts-expect-error: incompatible methods between interfaces
export const reminders: DataModel<ReminderSchema> = model('reminders', new Schema({
    user: String,
    reminder: String,
    remindAt: Number,
    message: String,
    msgURL: String,
    channel: String
}, { timestamps: true }));

// @ts-expect-error: incompatible methods between interfaces
export const rules: DataModel<RuleSchema> = model('rules', new Schema({
    guild: String,
    rules: Array
}));

// @ts-expect-error: incompatible methods between interfaces
export const setup: DataModel<SetupSchema> = model('setup', new Schema({
    guild: String,
    logsChannel: String,
    memberRole: String,
    botRole: String,
    mutedRole: String,
    lockChannels: Array
}), 'setup');

// @ts-expect-error: incompatible methods between interfaces
export const stickyRoles: DataModel<StickyRoleSchema> = model('sticky-roles', new Schema({
    guild: String,
    user: String,
    roles: Array
}));

// @ts-expect-error: incompatible methods between interfaces
export const todo: DataModel<TodoSchema> = model('todo', new Schema({
    user: String,
    list: Array
}), 'todo');

// @ts-expect-error: incompatible methods between interfaces
export const welcome: DataModel<WelcomeSchema> = model('welcome', new Schema({
    guild: String,
    channel: String,
    message: String
}), 'welcome');

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

export default {
    active,
    afk,
    disabled,
    errors,
    faq,
    mcIp,
    moderations,
    modules,
    polls,
    prefixes,
    reactionRoles,
    reminders,
    rules,
    setup,
    stickyRoles,
    todo,
    welcome,
};
