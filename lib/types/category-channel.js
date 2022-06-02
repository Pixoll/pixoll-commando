"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = require("../util");
const discord_js_1 = require("discord.js");
class CategoryChannelArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'category-channel');
    }
    validate(val, msg, arg) {
        const { client, guild } = msg;
        const { oneOf } = arg;
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) {
            try {
                const channel = client.channels.resolve(matches[1]);
                if (!channel || channel.type !== 'GUILD_CATEGORY')
                    return false;
                if (!oneOf?.includes(channel.id))
                    return false;
                return true;
            }
            catch (err) {
                return false;
            }
        }
        if (!guild)
            return false;
        const search = val.toLowerCase();
        let channels = guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0)
            return false;
        if (channels.size === 1) {
            if (!oneOf?.includes(channels.first().id))
                return false;
            return true;
        }
        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) {
            if (!oneOf?.includes(exactChannels.first().id))
                return false;
            return true;
        }
        if (exactChannels.size > 0)
            channels = exactChannels;
        return channels.size <= 15 ?
            `${(0, util_1.disambiguation)(channels.map(chan => discord_js_1.Util.escapeMarkdown(chan.name)), 'categories', null)}\n` :
            'Multiple categories found. Please be more specific.';
    }
    parse(val, msg) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches)
            return msg.client.channels.resolve(matches[1]) ?? null;
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
exports.default = CategoryChannelArgumentType;
function channelFilterExact(search) {
    return (chan) => chan.type === 'GUILD_CATEGORY' && chan.name.toLowerCase() === search;
}
function channelFilterInexact(search) {
    return (chan) => chan.type === 'GUILD_CATEGORY' && chan.name.toLowerCase().includes(search);
}
//# sourceMappingURL=category-channel.js.map