"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = require("../util");
const discord_js_1 = require("discord.js");
class MemberArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'member');
    }
    async validate(val, msg, arg) {
        const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
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
        if (members.size === 0)
            return false;
        if (members.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(members.first().id))
                return false;
            return true;
        }
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(exactMembers.first().id))
                return false;
            return true;
        }
        if (exactMembers.size > 0)
            members = exactMembers;
        return members.size <= 15 ?
            `${(0, util_1.disambiguation)(members.map(mem => discord_js_1.Util.escapeMarkdown(mem.user.tag)), 'members', null)}\n` :
            'Multiple members found. Please be more specific.';
    }
    parse(val, msg) {
        const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
        if (matches)
            return msg.guild.members.resolve(matches[1]) ?? null;
        const search = val.toLowerCase();
        const members = msg.guild.members.cache.filter(memberFilterInexact(search));
        if (members.size === 0)
            return null;
        if (members.size === 1)
            return members.first();
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.size === 1)
            return exactMembers.first();
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