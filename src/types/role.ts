import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoRole } from '../discord.overrides';

export default class RoleArgumentType extends ArgumentType<'role'> {
    public constructor(client: CommandoClient) {
        super(client, 'role');
    }

    public validate(value: string, message: CommandoMessage, argument: Argument<'role'>): boolean | string {
        if (!message.inGuild()) return false;

        const matches = value.match(/^(?:<@&)?(\d+)>?$/);
        if (matches) return message.guild.roles.cache.has(matches[1]);

        const search = value.toLowerCase();
        let roles = message.guild.roles.cache.filter(nameFilterInexact(search));
        const first = roles.first();
        if (!first) return false;
        if (roles.size === 1) {
            if (argument.oneOf && !argument.oneOf.includes(first.id)) return false;
            return true;
        }

        const exactRoles = roles.filter(nameFilterExact(search));
        const exact = exactRoles.first();
        if (exactRoles.size === 1 && exact) {
            if (argument.oneOf && !argument.oneOf.includes(exact.id)) return false;
            return true;
        }
        if (exactRoles.size > 0) roles = exactRoles;

        return roles.size <= 15
            ? `${Util.disambiguation(roles.map(role => `${escapeMarkdown(role.name)}`), 'roles')}\n`
            : 'Multiple roles found. Please be more specific.';
    }

    public parse(value: string, message: CommandoMessage): CommandoRole | null {
        if (!message.guild) return null;

        const matches = value.match(/^(?:<@&)?(\d+)>?$/);
        if (matches) return message.guild.roles.resolve(matches[1]);

        const search = value.toLowerCase();
        const roles = message.guild.roles.cache.filter(nameFilterInexact(search));
        if (roles.size === 0) return null;
        if (roles.size === 1) return roles.first() ?? null;

        const exactRoles = roles.filter(nameFilterExact(search));
        if (exactRoles.size === 1) return exactRoles.first() ?? null;

        return null;
    }
}

function nameFilterExact(search: string) {
    return (role: CommandoRole): boolean => role.name.toLowerCase() === search;
}

function nameFilterInexact(search: string) {
    return (role: CommandoRole): boolean => role.name.toLowerCase().includes(search);
}
