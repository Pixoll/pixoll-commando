"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = exports.removeDashes = exports.disambiguation = exports.noReplyInDMs = exports.isPromise = exports.probability = exports.escapeRegex = void 0;
const lodash_1 = require("lodash");
function escapeRegex(str) {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
exports.escapeRegex = escapeRegex;
function probability(n) {
    if (n > 1)
        n /= 100;
    return !!n && Math.random() <= n;
}
exports.probability = probability;
function isPromise(obj) {
    // @ts-expect-error: 'then' does not exist in type S
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}
exports.isPromise = isPromise;
function noReplyInDMs(msg) {
    const options = msg.channel.type === 'DM' ? {
        allowedMentions: { repliedUser: false }
    } : {};
    return options;
}
exports.noReplyInDMs = noReplyInDMs;
function disambiguation(items, label, property = 'name') {
    const itemList = items.map(item => `"${(property && typeof item !== 'string' ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
    return `Multiple ${label} found, please be more specific: ${itemList}`;
}
exports.disambiguation = disambiguation;
/**
 * @param str - The string to parse
 */
function removeDashes(str) {
    const arr = str.split('-');
    const first = arr.shift();
    const rest = arr.map(lodash_1.capitalize).join('');
    return first + rest;
}
exports.removeDashes = removeDashes;
exports.permissions = {
    CREATE_INSTANT_INVITE: 'Create instant invite',
    KICK_MEMBERS: 'Kick members',
    BAN_MEMBERS: 'Ban members',
    ADMINISTRATOR: 'Administrator',
    MANAGE_CHANNELS: 'Manage channels',
    MANAGE_GUILD: 'Manage server',
    ADD_REACTIONS: 'Add reactions',
    VIEW_AUDIT_LOG: 'View audit log',
    PRIORITY_SPEAKER: 'Priority speaker',
    STREAM: 'Video',
    VIEW_CHANNEL: 'View channels',
    SEND_MESSAGES: 'Send messages',
    SEND_TTS_MESSAGES: 'Send TTS messages',
    MANAGE_MESSAGES: 'Manage messages',
    EMBED_LINKS: 'Embed links',
    ATTACH_FILES: 'Attach files',
    READ_MESSAGE_HISTORY: 'Read message history',
    MENTION_EVERYONE: 'Mention everyone',
    USE_EXTERNAL_EMOJIS: 'Use external emojis',
    VIEW_GUILD_INSIGHTS: 'View server insights',
    CONNECT: 'Connect',
    SPEAK: 'Speak',
    MUTE_MEMBERS: 'Mute members',
    DEAFEN_MEMBERS: 'Deafen members',
    MOVE_MEMBERS: 'Move members',
    USE_VAD: 'Use voice activity',
    CHANGE_NICKNAME: 'Change nickname',
    MANAGE_NICKNAMES: 'Manage nicknames',
    MANAGE_ROLES: 'Manage roles',
    MANAGE_WEBHOOKS: 'Manage webhooks',
    MANAGE_EMOJIS_AND_STICKERS: 'Manage emojis and stickers',
    USE_APPLICATION_COMMANDS: 'Use application commands',
    REQUEST_TO_SPEAK: 'Request to speak',
    MANAGE_EVENTS: 'Manage events',
    MANAGE_THREADS: 'Manage threads',
    /** @deprecated This will be removed in discord.js v14 */
    USE_PUBLIC_THREADS: 'Use public threads',
    CREATE_PUBLIC_THREADS: 'Create public threads',
    /** @deprecated This will be removed in discord.js v14 */
    USE_PRIVATE_THREADS: 'Use private threads',
    CREATE_PRIVATE_THREADS: 'Create private threads',
    USE_EXTERNAL_STICKERS: 'Use external stickers',
    SEND_MESSAGES_IN_THREADS: 'Send messages in threads',
    START_EMBEDDED_ACTIVITIES: 'Start activities',
    MODERATE_MEMBERS: 'Time out members',
};
//# sourceMappingURL=util.js.map