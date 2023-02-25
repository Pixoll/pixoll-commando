"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class RoleArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'role');
    }
    validate(value, message, argument) {
        if (!message.inGuild())
            return false;
        const matches = value.match(/^(?:<@&)?(\d+)>?$/);
        if (matches)
            return message.guild.roles.cache.has(matches[1]);
        const search = value.toLowerCase();
        let roles = message.guild.roles.cache.filter(nameFilterInexact(search));
        const first = roles.first();
        if (!first)
            return false;
        if (roles.size === 1) {
            if (argument.oneOf && !argument.oneOf.includes(first.id))
                return false;
            return true;
        }
        const exactRoles = roles.filter(nameFilterExact(search));
        const exact = exactRoles.first();
        if (exactRoles.size === 1 && exact) {
            if (argument.oneOf && !argument.oneOf.includes(exact.id))
                return false;
            return true;
        }
        if (exactRoles.size > 0)
            roles = exactRoles;
        return roles.size <= 15
            ? `${util_1.default.disambiguation(roles.map(role => `${(0, discord_js_1.escapeMarkdown)(role.name)}`), 'roles')}\n`
            : 'Multiple roles found. Please be more specific.';
    }
    parse(value, message) {
        if (!message.guild)
            return null;
        const matches = value.match(/^(?:<@&)?(\d+)>?$/);
        if (matches)
            return message.guild.roles.resolve(matches[1]);
        const search = value.toLowerCase();
        const roles = message.guild.roles.cache.filter(nameFilterInexact(search));
        if (roles.size === 0)
            return null;
        if (roles.size === 1)
            return roles.first() ?? null;
        const exactRoles = roles.filter(nameFilterExact(search));
        if (exactRoles.size === 1)
            return exactRoles.first() ?? null;
        return null;
    }
}
exports.default = RoleArgumentType;
function nameFilterExact(search) {
    return (role) => role.name.toLowerCase() === search;
}
function nameFilterInexact(search) {
    return (role) => role.name.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9yb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBNEM7QUFNNUMsTUFBcUIsZ0JBQWlCLFNBQVEsY0FBb0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQWEsRUFBRSxPQUF3QixFQUFFLFFBQTBCO1FBQy9FLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFckMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2pELElBQUksT0FBTztZQUFFLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5RCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3pCLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDbEIsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUN2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