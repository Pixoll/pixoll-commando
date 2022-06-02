"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = require("../util");
const discord_js_1 = require("discord.js");
class RoleArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'role');
    }
    validate(val, msg, arg) {
        const matches = val.match(/^(?:<@&)?([0-9]+)>?$/);
        if (matches)
            return msg.guild.roles.cache.has(matches[1]);
        const search = val.toLowerCase();
        let roles = msg.guild.roles.cache.filter(nameFilterInexact(search));
        if (roles.size === 0)
            return false;
        if (roles.size === 1) {
            if (arg?.oneOf && !arg?.oneOf.includes(roles.first().id))
                return false;
            return true;
        }
        const exactRoles = roles.filter(nameFilterExact(search));
        if (exactRoles.size === 1) {
            if (arg?.oneOf && !arg?.oneOf.includes(exactRoles.first().id))
                return false;
            return true;
        }
        if (exactRoles.size > 0)
            roles = exactRoles;
        return roles.size <= 15 ?
            `${(0, util_1.disambiguation)(roles.map(role => `${discord_js_1.Util.escapeMarkdown(role.name)}`), 'roles', null)}\n` :
            'Multiple roles found. Please be more specific.';
    }
    parse(val, msg) {
        const matches = val.match(/^(?:<@&)?([0-9]+)>?$/);
        if (matches)
            return msg.guild.roles.cache.get(matches[1]) || null;
        const search = val.toLowerCase();
        const roles = msg.guild.roles.cache.filter(nameFilterInexact(search));
        if (roles.size === 0)
            return null;
        if (roles.size === 1)
            return roles.first();
        const exactRoles = roles.filter(nameFilterExact(search));
        if (exactRoles.size === 1)
            return exactRoles.first();
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
//# sourceMappingURL=role.js.map