"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class MemberArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'member');
    }
    async validate(value, message, argument) {
        if (typeof value === 'undefined' || !message.inGuild())
            return false;
        const matches = value.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) {
            try {
                const member = await message.guild.members.fetch(matches[1]);
                if (!member)
                    return false;
                if (argument.oneOf && !argument.oneOf.includes(member.id))
                    return false;
                return true;
            }
            catch (err) {
                return false;
            }
        }
        const search = value.toLowerCase();
        let members = message.guild.members.cache.filter(memberFilterInexact(search));
        const first = members.first();
        if (!first)
            return false;
        if (members.size === 1) {
            if (argument.oneOf && !argument.oneOf.includes(first.id))
                return false;
            return true;
        }
        const exactMembers = members.filter(memberFilterExact(search));
        const exact = exactMembers.first();
        if (exactMembers.size === 1 && exact) {
            if (argument.oneOf && !argument.oneOf.includes(exact.id))
                return false;
            return true;
        }
        if (exactMembers.size > 0)
            members = exactMembers;
        return members.size <= 15
            ? `${util_1.default.disambiguation(members.map(mem => (0, discord_js_1.escapeMarkdown)(mem.user.tag)), 'members')}\n`
            : 'Multiple members found. Please be more specific.';
    }
    parse(value, message) {
        if (!message.inGuild())
            return null;
        const matches = value.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches)
            return message.guild.members.resolve(matches[1]);
        const search = value.toLowerCase();
        const members = message.guild.members.cache.filter(memberFilterInexact(search));
        if (members.size === 0)
            return null;
        if (members.size === 1)
            return members.first() ?? null;
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.size === 1)
            return exactMembers.first() ?? null;
        return null;
    }
}
exports.default = MemberArgumentType;
function memberFilterExact(search) {
    return (member) => member.user.username.toLowerCase() === search
        || member.nickname?.toLowerCase() === search
        || member.user.tag.toLowerCase() === search;
}
function memberFilterInexact(search) {
    return (member) => member.user.username.toLowerCase().includes(search)
        || member.nickname?.toLowerCase().includes(search)
        || member.user.tag.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL21lbWJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUFrQztBQUNsQyxtREFBMkI7QUFDM0IsMkNBQXlEO0FBS3pELE1BQXFCLGtCQUFtQixTQUFRLGNBQXNCO0lBQ2xFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFRLENBQ2pCLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUE0QjtRQUVqRixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUVyRSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDbEQsSUFBSSxPQUFPLEVBQUU7WUFDVCxJQUFJO2dCQUNBLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDMUIsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDeEUsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1NBQ0o7UUFFRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMs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