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
    validate(value, message, argument) {
        if (typeof value === 'undefined' || !message.inGuild())
            return false;
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches)
            return message.guild.channels.cache.has(matches[1]);
        const search = value.toLowerCase();
        let channels = message.guild.channels.cache.filter(nameFilterInexact(search));
        const first = channels.first();
        if (!first)
            return false;
        if (channels.size === 1) {
            if (argument.oneOf && !argument.oneOf.includes(first.id))
                return false;
            return true;
        }
        const exactChannels = channels.filter(nameFilterExact(search));
        const exact = exactChannels.first();
        if (exactChannels.size === 1 && exact) {
            if (argument.oneOf && !argument.oneOf.includes(exact.id))
                return false;
            return true;
        }
        if (exactChannels.size > 0)
            channels = exactChannels;
        return channels.size <= 15
            ? `${util_1.default.disambiguation(channels.map(chan => (0, discord_js_1.escapeMarkdown)(chan.name)), 'channels')}\n`
            : 'Multiple channels found. Please be more specific.';
    }
    parse(value, message) {
        if (!message.inGuild())
            return null;
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches)
            return message.guild.channels.resolve(matches[1]);
        const search = value.toLowerCase();
        const channels = message.guild.channels.cache.filter(nameFilterInexact(search));
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
    return (channel) => channel.name.toLowerCase() === search;
}
function nameFilterInexact(search) {
    return (channel) => channel.name.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9jaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBK0Q7QUFLL0QsTUFBcUIsbUJBQW9CLFNBQVEsY0FBdUI7SUFDcEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUE2QjtRQUM5RixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUVyRSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEQsSUFBSSxPQUFPO1lBQUUsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpFLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDOUUsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDekIsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtZQUNyQixJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFB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