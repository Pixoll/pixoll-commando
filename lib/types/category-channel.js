"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class CategoryChannelArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'category-channel');
    }
    validate(value, message, argument) {
        if (typeof value === 'undefined')
            return false;
        const { client, guild } = message;
        const { oneOf } = argument;
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) {
            try {
                const channel = client.channels.resolve(matches[1]);
                if (!channel || channel.type !== discord_js_1.ChannelType.GuildCategory)
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
        const search = value.toLowerCase();
        let channels = guild.channels.cache.filter(channelFilterInexact(search));
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
            ? `${util_1.default.disambiguation(channels.map(chan => (0, discord_js_1.escapeMarkdown)(chan.name)), 'categories')}\n`
            : 'Multiple categories found. Please be more specific.';
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
exports.default = CategoryChannelArgumentType;
function channelFilterExact(search) {
    return (channel) => channel.type === discord_js_1.ChannelType.GuildCategory && channel.name.toLowerCase() === search;
}
function channelFilterInexact(search) {
    return (channel) => channel.type === discord_js_1.ChannelType.GuildCategory && channel.name.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcnktY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9jYXRlZ29yeS1jaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBNkY7QUFLN0YsTUFBcUIsMkJBQTRCLFNBQVEsY0FBZ0M7SUFDckYsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSxRQUFRLENBQ1gsS0FBeUIsRUFBRSxPQUF3QixFQUFFLFFBQXNDO1FBRTNGLElBQUksT0FBTyxLQUFLLEtBQUssV0FBVztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQy9DLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFFM0IsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2hELElBQUksT0FBTyxFQUFFO1lBQ1QsSUFBSTtnQkFDQSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsYUFBYTtvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDekUsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDL0MsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1NBQ0o7UUFFRCxJQUFJLENBQUMsS0FBSztZQUFFLE9B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