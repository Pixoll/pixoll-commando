import { Snowflake } from 'discord.js';
import { model, Schema } from 'mongoose';

export const active = model('active', new Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    role: String,
    duration: Number
}, { timestamps: true }), 'active');

export const afk = model('afk', new Schema({
    guild: String,
    user: String,
    status: String
}, { timestamps: true }), 'afk');

export const disabled = model('disabled', new Schema({
    guild: String,
    global: Boolean,
    commands: Array,
    groups: Array
}), 'disabled');

export const errors = model('errors', new Schema({
    _id: String,
    type: String,
    name: String,
    message: String,
    command: String,
    files: String,
}, { timestamps: true }));

export const faq = model('faq', new Schema({
    question: String,
    answer: String
}), 'faq');

export const mcIp = model('mc-ips', new Schema({
    guild: String,
    type: String,
    ip: String,
    port: Number
}));

export const moderations = model('moderations', new Schema({
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

export const modules = model('modules', new Schema({
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

export const prefixes = model('prefixes', new Schema({
    global: Boolean,
    guild: String,
    prefix: String
}));

export const polls = model('polls', new Schema({
    guild: String,
    channel: String,
    message: String,
    emojis: Array,
    duration: Number
}));

export const reactionRoles = model('reaction-roles', new Schema({
    guild: String,
    channel: String,
    message: String,
    roles: Array,
    emojis: Array
}));

export const reminders = model('reminders', new Schema({
    user: String,
    reminder: String,
    remindAt: Number,
    message: String,
    msgURL: String,
    channel: String
}, { timestamps: true }));

export const rules = model('rules', new Schema({
    guild: String,
    rules: Array
}));

export const setup = model('setup', new Schema({
    guild: String,
    logsChannel: String,
    memberRole: String,
    botRole: String,
    mutedRole: String,
    lockChannels: Array
}), 'setup');

export const stickyRoles = model('sticky-roles', new Schema({
    guild: String,
    user: String,
    roles: Array
}));

export const todo = model('todo', new Schema({
    user: String,
    list: Array
}), 'todo');

export const welcome = model('welcome', new Schema({
    guild: String,
    channel: String,
    message: String
}), 'welcome');

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
