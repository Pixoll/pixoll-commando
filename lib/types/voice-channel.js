"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class VoiceChannelArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'voice-channel');
    }
    validate(value, message, argument) {
        if (typeof value === 'undefined')
            return false;
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) {
            try {
                const channel = message.client.channels.resolve(matches[1]);
                if (!channel || channel.type !== discord_js_1.ChannelType.GuildVoice)
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
            ? `${util_1.default.disambiguation(channels.map(chan => (0, discord_js_1.escapeMarkdown)(chan.name)), 'voice channels')}\n`
            : 'Multiple voice channels found. Please be more specific.';
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
exports.default = VoiceChannelArgumentType;
function channelFilterExact(search) {
    return (channel) => channel.type === discord_js_1.ChannelType.GuildVoice && channel.name.toLowerCase() === search;
}
function channelFilterInexact(search) {
    return (channel) => channel.type === discord_js_1.ChannelType.GuildVoice && channel.name.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2UtY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy92b2ljZS1jaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBMEY7QUFLMUYsTUFBcUIsd0JBQXlCLFNBQVEsY0FBNkI7SUFDL0UsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sUUFBUSxDQUNYLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFtQztRQUV4RixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMvQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEQsSUFBSSxPQUFPLEVBQUU7WUFDVCxJQUFJO2dCQUNBLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsVUFBVTtvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDdEUsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDekUsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1NBQ0o7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUVqQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3pCLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDckIsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUN2RSxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRTtZQUNuQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLEdBQUcsQ0FBQztZQUFFLFFBQVEsR0FBRyxhQUFhLENBQUM7UUFFckQsT0FBTyxRQUFRLENBQUMsSUFBSSxJQUFJLEVBQUU7WUFDdEIsQ0FBQyxDQUFDLEdBQUcsY0FBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBQSwyQkFBYyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLElBQUk7WUFDL0YsQ0FBQyxDQUFDLHlEQUF5RCxDQUFDO0lBQ3BFLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBYSxFQUFFLE9BQXdCO1FBQ2hELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNoRCxJQUFJLE9BQU87WUFBRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQXdCLENBQUM7UUFFdkYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFaEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ25DLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNuRixJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3JDLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDO1lBQUUsT0FBTyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDO1FBRXpELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUFFLE9BQU8sYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQztRQUVuRSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUE3REQsMkNBNkRDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxNQUFjO0lBQ3RDLE9BQU8sQ0FBQyxPQUEwQixFQUEyQixFQUFFLENBQzNELE9BQU8sQ0FBQyxJQUFJLEtBQUssd0JBQVcsQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLENBQUM7QUFDekYsQ0FBQztBQUVELFNBQVMsb0JBQW9CLENBQUMsTUFBYztJQUN4QyxPQUFPLENBQUMsT0FBMEIsRUFBMkIsRUFBRSxDQUMzRCxPQUFPLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9GLENBQUMifQ==