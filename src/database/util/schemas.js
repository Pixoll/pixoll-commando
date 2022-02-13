const { model, Schema } = require('mongoose');

const active = model('active', Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    role: String,
    duration: Number
}, { timestamps: true }), 'active');

const afk = model('afk', Schema({
    guild: String,
    user: String,
    status: String
}, { timestamps: true }), 'afk');

const disabled = model('disabled', Schema({
    guild: String,
    global: Boolean,
    commands: Array,
    groups: Array
}), 'disabled');

const errors = model('errors', Schema({
    _id: String,
    type: String,
    name: String,
    message: String,
    command: String,
    files: String,
}, { timestamps: true }));

const faq = model('faq', Schema({
    question: String,
    answer: String
}), 'faq');

const mcIp = model('mc-ips', Schema({
    guild: String,
    type: String,
    ip: String,
    port: Number
}));

const moderations = model('moderations', Schema({
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

const modules = model('modules', Schema({
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

const prefixes = model('prefixes', Schema({
    global: Boolean,
    guild: String,
    prefix: String
}));

const polls = model('polls', Schema({
    guild: String,
    channel: String,
    message: String,
    emojis: Array,
    duration: Number
}));

const reactionRoles = model('reaction-roles', Schema({
    guild: String,
    channel: String,
    message: String,
    roles: Array,
    emojis: Array
}));

const reminders = model('reminders', Schema({
    user: String,
    reminder: String,
    remindAt: Number,
    message: String,
    msgURL: String,
    channel: String
}, { timestamps: true }));

const rules = model('rules', Schema({
    guild: String,
    rules: Array
}));

const setup = model('setup', Schema({
    guild: String,
    logsChannel: String,
    memberRole: String,
    botRole: String,
    mutedRole: String,
    lockChannels: Array
}), 'setup');

const stickyRoles = model('sticky-roles', Schema({
    guild: String,
    user: String,
    roles: Array
}));

const todo = model('todo', Schema({
    user: String,
    list: Array
}), 'todo');

const welcome = model('welcome', Schema({
    guild: String,
    channel: String,
    message: String
}), 'welcome');

module.exports = {
    active,
    afk,
    disabled,
    errors,
    faq,
    mcIp,
    moderations,
    modules,
    prefixes,
    polls,
    reactionRoles,
    reminders,
    rules,
    setup,
    stickyRoles,
    todo,
    welcome,
};
