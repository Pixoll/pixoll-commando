"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = require("../util");
const discord_js_1 = require("discord.js");
class ChannelArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'channel');
    }
    validate(val, msg, arg) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches)
            return msg.guild.channels.cache.has(matches[1]);
        const search = val.toLowerCase();
        let channels = msg.guild.channels.cache.filter(nameFilterInexact(search));
        if (channels.size === 0)
            return false;
        if (channels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(channels.first().id))
                return false;
            return true;
        }
        const exactChannels = channels.filter(nameFilterExact(search));
        if (exactChannels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(exactChannels.first().id))
                return false;
            return true;
        }
        if (exactChannels.size > 0)
            channels = exactChannels;
        return channels.size <= 15 ?
            `${(0, util_1.disambiguation)(channels.map(chan => discord_js_1.Util.escapeMarkdown(chan.name)), 'channels', null)}\n` :
            'Multiple channels found. Please be more specific.';
    }
    parse(val, msg) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches)
            return msg.guild.channels.cache.get(matches[1]) ?? null;
        const search = val.toLowerCase();
        const channels = msg.guild.channels.cache.filter(nameFilterInexact(search));
        if (channels.size === 0)
            return null;
        if (channels.size === 1)
            return channels.first();
        const exactChannels = channels.filter(nameFilterExact(search));
        if (exactChannels.size === 1)
            return exactChannels.first();
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