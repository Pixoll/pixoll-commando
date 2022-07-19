"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class ThreadChannelArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'thread-channel');
    }
    validate(val, msg, arg) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) {
            try {
                const channel = msg.client.channels.resolve(matches[1]);
                if (!channel || channel.isThread())
                    return false;
                if (arg.oneOf && !arg.oneOf.includes(channel.id))
                    return false;
                return true;
            }
            catch (err) {
                return false;
            }
        }
        if (!msg.guild)
            return false;
        const search = val.toLowerCase();
        let channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0)
            return false;
        if (channels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(channels.first().id))
                return false;
            return true;
        }
        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(exactChannels.first().id))
                return false;
            return true;
        }
        if (exactChannels.size > 0)
            channels = exactChannels;
        return channels.size <= 15 ?
            `${util_1.default.disambiguation(channels.map(chan => (0, discord_js_1.escapeMarkdown)(chan.name)), 'thread channels')}\n` :
            'Multiple thread channels found. Please be more specific.';
    }
    parse(val, msg) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches)
            return msg.client.channels.resolve(matches[1]) || null;
        if (!msg.guild)
            return null;
        const search = val.toLowerCase();
        const channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0)
            return null;
        if (channels.size === 1)
            return channels.first();
        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1)
            return exactChannels.first();
        return null;
    }
}
exports.default = ThreadChannelArgumentType;
function channelFilterExact(search) {
    return (chan) => chan.isThread() && chan.name.toLowerCase() === search;
}
function channelFilterInexact(search) {
    return (chan) => chan.isThread() && chan.name.toLowerCase().includes(search);
}
//# sourceMappingURL=thread-channel.js.map