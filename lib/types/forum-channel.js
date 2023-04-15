"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class ForumChannelArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'forum-channel');
    }
    validate(value, message, argument) {
        if (typeof value === 'undefined')
            return false;
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) {
            try {
                const channel = message.client.channels.resolve(matches[1]);
                if (!channel || channel.type !== discord_js_1.ChannelType.GuildAnnouncement)
                    return false;
                if (argument.oneOf && !argument.oneOf.includes(channel.id))
                    return false;
                return true;
            }
            catch (err) {
                return false;
            }
        }
        if (!message.guild)
            return false;
        const search = value.toLowerCase();
        let channels = message.guild.channels.cache.filter(channelFilterInexact(search));
        const first = channels.first();
        if (!first)
            return false;
        if (channels.size === 1) {
            if (argument.oneOf && !argument.oneOf.includes(first.id))
                return false;
            return true;
        }
        const exactChannels = channels.filter(channelFilterExact(search));
        const exact = exactChannels.first();
        if (exactChannels.size === 1 && exact) {
            if (argument.oneOf && !argument.oneOf.includes(exact.id))
                return false;
            return true;
        }
        if (exactChannels.size > 0)
            channels = exactChannels;
        return channels.size <= 15
            ? `${util_1.default.disambiguation(channels.map(chan => (0, discord_js_1.escapeMarkdown)(chan.name)), 'forum channels')}\n`
            : 'Multiple text channels found. Please be more specific.';
    }
    parse(value, message) {
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches)
            return message.client.channels.resolve(matches[1]);
        if (!message.guild)
            return null;
        const search = value.toLowerCase();
        const channels = message.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0)
            return null;
        if (channels.size === 1)
            return channels.first() ?? null;
        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1)
            return exactChannels.first() ?? null;
        return null;
    }
}
exports.default = ForumChannelArgumentType;
function channelFilterExact(search) {
    return (channel) => channel.type === discord_js_1.ChannelType.GuildForum && channel.name.toLowerCase() === search;
}
function channelFilterInexact(search) {
    return (chan) => chan.type === discord_js_1.ChannelType.GuildForum && chan.name.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ydW0tY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9mb3J1bS1jaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBMEY7QUFLMUYsTUFBcUIsd0JBQXlCLFNBQVEsY0FBNkI7SUFDL0UsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sUUFBUSxDQUNYLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFtQztRQUV4RixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMvQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEQsSUFBSSxPQUFPLEVBQUU7WUFDVCxJQUFJO2dCQUNBLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsaUJBQWlCO29CQUFFLE9BQU8sS0FBSyxDQUFDO2dCQUM3RSxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUFFLE9BQU8sS0FBSyxDQUFDO2dCQUN6RSxPQUFPLElBQUksQ0FBQzthQUNmO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLENBQUM7YUFDaEI7U0FDSjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRWpDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFX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