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
        if (typeof value === 'undefined' || !message.inGuild())
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9yb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBa0Q7QUFLbEQsTUFBcUIsZ0JBQWlCLFNBQVEsY0FBb0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUEwQjtRQUMzRixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUVyRSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDakQsSUFBSSxPQUFPO1lBQUUsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTlELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEUsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDekIsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtZQUNsQixJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRTtZQUNoQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQztZQUFFLEtBQUssR0FBRyxVQUFVLENBQUM7UUFFNUMsT0FBTyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUU7WUFDbkIsQ0FBQyxDQUFDLEdBQUcsY0FBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFBLDJCQUFjLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSTtZQUN4RixDQUFDLENBQUMsZ0RBQWdELENBQUM7SUFDM0QsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhLEVBQUUsT0FBd0I7UUFDaEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFaEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2pELElBQUksT0FBTztZQUFFLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNsQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQztRQUVuRCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxDQUFDO1lBQUUsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDO1FBRTdELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQWpERCxtQ0FpREM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxNQUFjO0lBQ25DLE9BQU8sQ0FBQyxJQUFVLEVBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDO0FBQ3ZFLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLE1BQWM7SUFDckMsT0FBTyxDQUFDLElBQVUsRUFBVyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0UsQ0FBQyJ9