"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcome = exports.todo = exports.stickyRoles = exports.setup = exports.rules = exports.reminders = exports.reactionRoles = exports.polls = exports.prefixes = exports.modules = exports.moderations = exports.mcIp = exports.faq = exports.errors = exports.disabled = exports.afk = exports.active = void 0;
const mongoose_1 = require("mongoose");
exports.active = (0, mongoose_1.model)('active', new mongoose_1.Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    role: String,
    duration: Number
}, { timestamps: true }), 'active');
exports.afk = (0, mongoose_1.model)('afk', new mongoose_1.Schema({
    guild: String,
    user: String,
    status: String
}, { timestamps: true }), 'afk');
exports.disabled = (0, mongoose_1.model)('disabled', new mongoose_1.Schema({
    guild: String,
    global: Boolean,
    commands: Array,
    groups: Array
}), 'disabled');
exports.errors = (0, mongoose_1.model)('errors', new mongoose_1.Schema({
    _id: String,
    type: String,
    name: String,
    message: String,
    command: String,
    files: String,
}, { timestamps: true }));
exports.faq = (0, mongoose_1.model)('faq', new mongoose_1.Schema({
    question: String,
    answer: String
}), 'faq');
exports.mcIp = (0, mongoose_1.model)('mc-ips', new mongoose_1.Schema({
    guild: String,
    type: String,
    ip: String,
    port: Number
}));
exports.moderations = (0, mongoose_1.model)('moderations', new mongoose_1.Schema({
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
exports.modules = (0, mongoose_1.model)('modules', new mongoose_1.Schema({
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
exports.prefixes = (0, mongoose_1.model)('prefixes', new mongoose_1.Schema({
    global: Boolean,
    guild: String,
    prefix: String
}));
exports.polls = (0, mongoose_1.model)('polls', new mongoose_1.Schema({
    guild: String,
    channel: String,
    message: String,
    emojis: Array,
    duration: Number
}));
exports.reactionRoles = (0, mongoose_1.model)('reaction-roles', new mongoose_1.Schema({
    guild: String,
    channel: String,
    message: String,
    roles: Array,
    emojis: Array
}));
exports.reminders = (0, mongoose_1.model)('reminders', new mongoose_1.Schema({
    user: String,
    reminder: String,
    remindAt: Number,
    message: String,
    msgURL: String,
    channel: String
}, { timestamps: true }));
exports.rules = (0, mongoose_1.model)('rules', new mongoose_1.Schema({
    guild: String,
    rules: Array
}));
exports.setup = (0, mongoose_1.model)('setup', new mongoose_1.Schema({
    guild: String,
    logsChannel: String,
    memberRole: String,
    botRole: String,
    mutedRole: String,
    lockChannels: Array
}), 'setup');
exports.stickyRoles = (0, mongoose_1.model)('sticky-roles', new mongoose_1.Schema({
    guild: String,
    user: String,
    roles: Array
}));
exports.todo = (0, mongoose_1.model)('todo', new mongoose_1.Schema({
    user: String,
    list: Array
}), 'todo');
exports.welcome = (0, mongoose_1.model)('welcome', new mongoose_1.Schema({
    guild: String,
    channel: String,
    message: String
}), 'welcome');
//# sourceMappingURL=schemas.js.map