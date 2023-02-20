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
    async validate(val, msg, arg) {
        if (!msg.guild)
            return false;
        const matches = val.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) {
            try {
                const member = await msg.guild.members.fetch(matches[1]);
                if (!member)
                    return false;
                if (arg.oneOf && !arg.oneOf.includes(member.id))
                    return false;
                return true;
            }
            catch (err) {
                return false;
            }
        }
        const search = val.toLowerCase();
        let members = msg.guild.members.cache.filter(memberFilterInexact(search));
        const first = members.first();
        if (!first)
            return false;
        if (members.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(first.id))
                return false;
            return true;
        }
        const exactMembers = members.filter(memberFilterExact(search));
        const exact = exactMembers.first();
        if (exactMembers.size === 1 && exact) {
            if (arg.oneOf && !arg.oneOf.includes(exact.id))
                return false;
            return true;
        }
        if (exactMembers.size > 0)
            members = exactMembers;
        return members.size <= 15
            ? `${util_1.default.disambiguation(members.map(mem => (0, discord_js_1.escapeMarkdown)(mem.user.tag)), 'members')}\n`
            : 'Multiple members found. Please be more specific.';
    }
    parse(val, msg) {
        if (!msg.guild)
            return null;
        const matches = val.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches)
            return msg.guild.members.resolve(matches[1]);
        const search = val.toLowerCase();
        const members = msg.guild.members.cache.filter(memberFilterInexact(search));
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
    return (mem) => mem.user.username.toLowerCase() === search
        || mem.nickname?.toLowerCase() === search
        || mem.user.tag.toLowerCase() === search;
}
function memberFilterInexact(search) {
    return (mem) => mem.user.username.toLowerCase().includes(search)
        || mem.nickname?.toLowerCase().includes(search)
        || mem.user.tag.toLowerCase().includes(search);
}
//# sourceMappingURL=member.js.map