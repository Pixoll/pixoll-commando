"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class UserArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'user');
    }
    async validate(val, msg, arg) {
        const matches = val.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) {
            try {
                const user = await msg.client.users.fetch(matches[1]);
                if (!user)
                    return false;
                if (arg.oneOf && !arg.oneOf.includes(user.id))
                    return false;
                return true;
            }
            catch (err) {
                return false;
            }
        }
        if (!msg.guild)
            return false;
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
        return members.size <= 15 ?
            `${util_1.default.disambiguation(members.map(mem => (0, discord_js_1.escapeMarkdown)(mem.user.tag)), 'users')}\n` :
            'Multiple users found. Please be more specific.';
    }
    parse(val, msg) {
        const matches = val.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches)
            return msg.client.users.resolve(matches[1]);
        if (!msg.guild)
            return null;
        const search = val.toLowerCase();
        const members = msg.guild.members.cache.filter(memberFilterInexact(search));
        const first = members.first();
        if (!first)
            return null;
        if (members.size === 1)
            return first.user;
        const exactMembers = members.filter(memberFilterExact(search));
        const exact = exactMembers.first();
        if (exactMembers.size === 1 && exact)
            return exact.user;
        return null;
    }
}
exports.default = UserArgumentType;
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
//# sourceMappingURL=user.js.map