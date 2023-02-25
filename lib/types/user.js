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
    async validate(value, message, argument) {
        const matches = value.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) {
            try {
                const user = await message.client.users.fetch(matches[1]);
                if (!user)
                    return false;
                if (argument.oneOf && !argument.oneOf.includes(user.id))
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
            ? `${util_1.default.disambiguation(members.map(mem => (0, discord_js_1.escapeMarkdown)(mem.user.tag)), 'users')}\n`
            : 'Multiple users found. Please be more specific.';
    }
    parse(value, message) {
        const matches = value.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches)
            return message.client.users.resolve(matches[1]);
        if (!message.inGuild())
            return null;
        const search = value.toLowerCase();
        const members = message.guild.members.cache.filter(memberFilterInexact(search));
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
    return (member) => member.user.username.toLowerCase() === search
        || member.nickname?.toLowerCase() === search
        || member.user.tag.toLowerCase() === search;
}
function memberFilterInexact(search) {
    return (member) => member.user.username.toLowerCase().includes(search)
        || member.nickname?.toLowerCase().includes(search)
        || member.user.tag.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy91c2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBNEM7QUFNNUMsTUFBcUIsZ0JBQWlCLFNBQVEsY0FBb0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFhLEVBQUUsT0FBd0IsRUFBRSxRQUEwQjtRQUNyRixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDbEQsSUFBSSxPQUFPLEVBQUU7WUFDVCxJQUFJO2dCQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFBRSxPQUFPLEtBQUssQ0FBQztnQkFDdEUsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1NBQ0o7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRXJDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFD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