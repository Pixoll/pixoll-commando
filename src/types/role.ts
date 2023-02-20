import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown, Role } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';

export default class RoleArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'role');
    }

    public validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string {
        if (!msg.guild) return false;

        const matches = val.match(/^(?:<@&)?(\d+)>?$/);
        if (matches) return msg.guild.roles.cache.has(matches[1]);

        const search = val.toLowerCase();
        let roles = msg.guild.roles.cache.filter(nameFilterInexact(search));
        const first = roles.first();
        if (!first) return false;
        if (roles.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(first.id)) return false;
            return true;
        }

        const exactRoles = roles.filter(nameFilterExact(search));
        const exact = exactRoles.first();
        if (exactRoles.size === 1 && exact) {
            if (arg.oneOf && !arg.oneOf.includes(exact.id)) return false;
            return true;
        }
        if (exactRoles.size > 0) roles = exactRoles;

        return roles.size <= 15
            ? `${Util.disambiguation(roles.map(role => `${escapeMarkdown(role.name)}`), 'roles')}\n`
            : 'Multiple roles found. Please be more specific.';
    }

    public parse(val: string, msg: CommandoMessage): Role | null {
        if (!msg.guild) return null;

        const matches = val.match(/^(?:<@&)?(\d+)>?$/);
        if (matches) return msg.guild.roles.resolve(matches[1]);

        const search = val.toLowerCase();
        const roles = msg.guild.roles.cache.filter(nameFilterInexact(search));
        if (roles.size === 0) return null;
        if (roles.size === 1) return roles.first() ?? null;

        const exactRoles = roles.filter(nameFilterExact(search));
        if (exactRoles.size === 1) return exactRoles.first() ?? null;

        return null;
    }
}

function nameFilterExact(search: string) {
    return (role: Role): boolean => role.name.toLowerCase() === search;
}

function nameFilterInexact(search: string) {
    return (role: Role): boolean => role.name.toLowerCase().includes(search);
}
