import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown, GuildMember, User } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';

export default class UserArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'user');
    }

    public async validate(val: string, msg: CommandoMessage, arg: Argument): Promise<boolean | string> {
        const matches = val.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) {
            try {
                const user = await msg.client.users.fetch(matches[1]);
                if (!user) return false;
                if (arg.oneOf && !arg.oneOf.includes(user.id)) return false;
                return true;
            } catch (err) {
                return false;
            }
        }

        if (!msg.guild) return false;

        const search = val.toLowerCase();
        let members = msg.guild.members.cache.filter(memberFilterInexact(search));
        const first = members.first();
        if (!first) return false;
        if (members.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(first.id)) return false;
            return true;
        }

        const exactMembers = members.filter(memberFilterExact(search));
        const exact = exactMembers.first();
        if (exactMembers.size === 1 && exact) {
            if (arg.oneOf && !arg.oneOf.includes(exact.id)) return false;
            return true;
        }
        if (exactMembers.size > 0) members = exactMembers;

        return members.size <= 15
            ? `${Util.disambiguation(members.map(mem => escapeMarkdown(mem.user.tag)), 'users')}\n`
            : 'Multiple users found. Please be more specific.';
    }

    public parse(val: string, msg: CommandoMessage): User | null {
        const matches = val.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) return msg.client.users.resolve(matches[1]);

        if (!msg.guild) return null;

        const search = val.toLowerCase();
        const members = msg.guild.members.cache.filter(memberFilterInexact(search));
        const first = members.first();
        if (!first) return null;
        if (members.size === 1) return first.user;

        const exactMembers = members.filter(memberFilterExact(search));
        const exact = exactMembers.first();
        if (exactMembers.size === 1 && exact) return exact.user;

        return null;
    }
}

function memberFilterExact(search: string) {
    return (mem: GuildMember): boolean =>
        mem.user.username.toLowerCase() === search
        || mem.nickname?.toLowerCase() === search
        || mem.user.tag.toLowerCase() === search;
}

function memberFilterInexact(search: string) {
    return (mem: GuildMember): boolean =>
        mem.user.username.toLowerCase().includes(search)
        || mem.nickname?.toLowerCase().includes(search)
        || mem.user.tag.toLowerCase().includes(search);
}
