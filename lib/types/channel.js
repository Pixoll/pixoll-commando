"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class ChannelArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'channel');
    }
    validate(val, msg, arg) {
        if (!msg.guild)
            return false;
        const matches = val.match(/^(?:<#)?(\d+)>?$/);
        if (matches)
            return msg.guild.channels.cache.has(matches[1]);
        const search = val.toLowerCase();
        let channels = msg.guild.channels.cache.filter(nameFilterInexact(search));
        const first = channels.first();
        if (!first)
            return false;
        if (channels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(first.id))
                return false;
            return true;
        }
        const exactChannels = channels.filter(nameFilterExact(search));
        const exact = exactChannels.first();
        if (exactChannels.size === 1 && exact) {
            if (arg.oneOf && !arg.oneOf.includes(exact.id))
                return false;
            return true;
        }
        if (exactChannels.size > 0)
            channels = exactChannels;
        return channels.size <= 15
            ? `${util_1.default.disambiguation(channels.map(chan => (0, discord_js_1.escapeMarkdown)(chan.name)), 'channels')}\n`
            : 'Multiple channels found. Please be more specific.';
    }
    parse(val, msg) {
        if (!msg.guild)
            return null;
        const matches = val.match(/^(?:<#)?(\d+)>?$/);
        if (matches)
            return msg.guild.channels.resolve(matches[1]);
        const search = val.toLowerCase();
        const channels = msg.guild.channels.cache.filter(nameFilterInexact(search));
        if (channels.size === 0)
            return null;
        if (channels.size === 1)
            return channels.first() ?? null;
        const exactChannels = channels.filter(nameFilterExact(search));
        if (exactChannels.size === 1)
            return exactChannels.first() ?? null;
        return null;
    }
}
exports.default = ChannelArgumentType;
function nameFilterExact(search) {
    return (chan) => chan.name.toLowerCase() === search;
}
function nameFilterInexact(search) {
    return (chan) => chan.name.toLowerCase().includes(search);
}
//# sourceMappingURL=channel.js.map