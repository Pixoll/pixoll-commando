import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoGuildMember } from '../discord.overrides';

export default class MemberArgumentType extends ArgumentType<'member'> {
    public constructor(client: CommandoClient) {
        super(client, 'member');
    }

    public async validate(
        value: string | undefined, message: CommandoMessage, argument: Argument<'member'>
    ): Promise<boolean | string> {
        if (typeof value === 'undefined' || !message.inGuild()) return false;

        const matches = value.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) {
            try {
                const member = await message.guild.members.fetch(matches[1]);
                if (!member) return false;
                if (argument.oneOf && !argument.oneOf.includes(member.id)) return false;
                return true;
            } catch (err) {
                return false;
            }
        }

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
            ? `${Util.disambiguation(members.map(mem => escapeMarkdown(mem.user.tag)), 'members')}\n`
            : 'Multiple members found. Please be more specific.';
    }

    public parse(value: string, message: CommandoMessage): CommandoGuildMember | null {
        if (!message.inGuild()) return null;

        const matches = value.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) return message.guild.members.resolve(matches[1]);

        const search = value.toLowerCase();
        const members = message.guild.members.cache.filter(memberFilterInexact(search));
        if (members.size === 0) return null;
        if (members.size === 1) return members.first() ?? null;

        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.size === 1) return exactMembers.first() ?? null;

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
