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
        if (typeof value === 'undefined')
            return false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy91c2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBK0Q7QUFLL0QsTUFBcUIsZ0JBQWlCLFNBQVEsY0FBb0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQVEsQ0FDakIsS0FBeUIsRUFBRSxPQUF3QixFQUFFLFFBQTBCO1FBRS9FLElBQUksT0FBTyxLQUFLLEtBQUssV0FBVztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQy9DLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNsRCxJQUFJLE9BQU8sRUFBRTtZQUNULElBQUk7Z0JBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxJQUFJO29CQUFFLE9BQU8sS0FBSyxDQUFDO2dCQUN4QixJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUFFLE9BQU8sS0FBSyxDQUFDO2dCQUN0RSxPQUFPLElBQUksQ0FBQzthQUNmO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLENBQUM7YUFDaEI7U0FDSjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFckMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ25DLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FB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