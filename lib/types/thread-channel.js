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
    validate(value, message, argument) {
        if (typeof value === 'undefined')
            return false;
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) {
            try {
                const channel = message.client.channels.resolve(matches[1]);
                if (!channel || channel.isThread())
                    return false;
                if (argument.oneOf && !argument.oneOf.includes(channel.id))
                    return false;
                return true;
            }
            catch (err) {
                return false;
            }
        }
        if (!message.inGuild())
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
            ? `${util_1.default.disambiguation(channels.map(chan => (0, discord_js_1.escapeMarkdown)(chan.name)), 'thread channels')}\n`
            : 'Multiple thread channels found. Please be more specific.';
    }
    parse(value, message) {
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches)
            return message.client.channels.resolve(matches[1]);
        if (!message.inGuild())
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
exports.default = ThreadChannelArgumentType;
function channelFilterExact(search) {
    return (chan) => chan.isThread() && chan.name.toLowerCase() === search;
}
function channelFilterInexact(search) {
    return (chan) => chan.isThread() && chan.name.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWFkLWNoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvdGhyZWFkLWNoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBa0M7QUFDbEMsbURBQTJCO0FBQzNCLDJDQUFpRjtBQUtqRixNQUFxQix5QkFBMEIsU0FBUSxjQUE4QjtJQUNqRixZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLFFBQVEsQ0FDWCxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBb0M7UUFFekYsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDL0MsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2hELElBQUksT0FBTyxFQUFFO1lBQ1QsSUFBSTtnQkFDQSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDakQsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDekUsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1NBQ0o7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRXJDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FB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