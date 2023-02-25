import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoUser, CommandoGuildMember } from '../discord.overrides';

export default class UserArgumentType extends ArgumentType<'user'> {
    public constructor(client: CommandoClient) {
        super(client, 'user');
    }

    public async validate(value: string, message: CommandoMessage, argument: Argument<'user'>): Promise<boolean | string> {
        const matches = value.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) {
            try {
                const user = await message.client.users.fetch(matches[1]);
                if (!user) return false;
                if (argument.oneOf && !argument.oneOf.includes(user.id)) return false;
                return true;
            } catch (err) {
                return false;
            }
        }

        if (!message.inGuild()) return false;

        const search = value.toLowerCase();
        let members = message.guild.members.cache.filter(memberFilterInexact(search));
        const first = members.first();
        if (!first) return false;
        if (members.size === 1) {
            if (argument.oneOf && !argument.oneOf.includes(first.id)) return false;
            return true;
        }

        const exactMembers = members.filter(memberFilterExact(search));
        const exact = exactMembers.first();
        if (exactMembers.size === 1 && exact) {
            if (argument.oneOf && !argument.oneOf.includes(exact.id)) return false;
            return true;
        }
        if (exactMembers.size > 0) members = exactMembers;

        return members.size <= 15
            ? `${Util.disambiguation(members.map(mem => escapeMarkdown(mem.user.tag)), 'users')}\n`
            : 'Multiple users found. Please be more specific.';
    }

    public parse(value: string, message: CommandoMessage): CommandoUser | null {
        const matches = value.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) return message.client.users.resolve(matches[1]) as CommandoUser | null;

        if (!message.inGuild()) return null;

        const search = value.toLowerCase();
        const members = message.guild.members.cache.filter(memberFilterInexact(search));
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
    return (member: CommandoGuildMember): boolean =>
        member.user.username.toLowerCase() === search
        || member.nickname?.toLowerCase() === search
        || member.user.tag.toLowerCase() === search;
}

function memberFilterInexact(search: string) {
    return (member: CommandoGuildMember): boolean =>
        member.user.username.toLowerCase().includes(search)
        || member.nickname?.toLowerCase().includes(search)
        || member.user.tag.toLowerCase().includes(search);
}
