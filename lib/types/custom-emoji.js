"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class CustomEmojiArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'custom-emoji');
    }
    validate(value, msg) {
        const matches = value.match(/^(?:<a?:([a-zA-Z0-9_]+):)?([0-9]+)>?$/);
        if (matches && msg.client.emojis.cache.has(matches[2]))
            return true;
        if (!msg.guild)
            return false;
        const search = value.toLowerCase();
        let emojis = msg.guild.emojis.cache.filter(nameFilterInexact(search));
        if (!emojis.size)
            return false;
        if (emojis.size === 1)
            return true;
        const exactEmojis = emojis.filter(nameFilterExact(search));
        if (exactEmojis.size === 1)
            return true;
        if (exactEmojis.size > 0)
            emojis = exactEmojis;
        return emojis.size <= 15 ?
            `${util_1.default.disambiguation(emojis.map(emoji => (0, discord_js_1.escapeMarkdown)(emoji.name)), 'emojis')}\n` :
            'Multiple emojis found. Please be more specific.';
    }
    parse(value, msg) {
        if (!msg.guild)
            return null;
        const matches = value.match(/^(?:<a?:([a-zA-Z0-9_]+):)?([0-9]+)>?$/);
        if (matches)
            return msg.client.emojis.cache.get(matches[2]) ?? null;
        const search = value.toLowerCase();
        const emojis = msg.guild.emojis.cache.filter(nameFilterInexact(search));
        if (!emojis.size)
            return null;
        if (emojis.size === 1)
            return emojis.first();
        const exactEmojis = emojis.filter(nameFilterExact(search));
        if (exactEmojis.size === 1)
            return exactEmojis.first();
        return null;
    }
}
exports.default = CustomEmojiArgumentType;
function nameFilterExact(search) {
    return (emoji) => emoji.name.toLowerCase() === search;
}
function nameFilterInexact(search) {
    return (emoji) => emoji.name.toLowerCase().includes(search);
}
//# sourceMappingURL=custom-emoji.js.map