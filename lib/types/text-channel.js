"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class TextChannelArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'text-channel');
    }
    validate(value, message, argument) {
        if (typeof value === 'undefined')
            return false;
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) {
            try {
                const channel = message.client.channels.resolve(matches[1]);
                if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
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
            ? `${util_1.default.disambiguation(channels.map(chan => (0, discord_js_1.escapeMarkdown)(chan.name)), 'text channels')}\n`
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
exports.default = TextChannelArgumentType;
function channelFilterExact(search) {
    return (channel) => channel.type === discord_js_1.ChannelType.GuildText && channel.name.toLowerCase() === search;
}
function channelFilterInexact(search) {
    return (chan) => chan.type === discord_js_1.ChannelType.GuildText && chan.name.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1jaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL3RleHQtY2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUFrQztBQUNsQyxtREFBMkI7QUFDM0IsMkNBQXlGO0FBS3pGLE1BQXFCLHVCQUF3QixTQUFRLGNBQTRCO0lBQzdFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLFFBQVEsQ0FDWCxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0M7UUFFdkYsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDL0MsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2hELElBQUksT0FBTyxFQUFFO1lBQ1QsSUFBSTtnQkFDQSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLFNBQVM7b0JBQUUsT0FBTyxLQUFLLENBQUM7Z0JBQ3JFLElBQUksUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQUUsT0FBTyxLQUFLLENBQUM7Z0JBQ3pFLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDVixPQUFPLEtBQUssQ0FBQzthQUNoQjtTQUNKO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFakMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFB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