import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown, GuildMember } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';

export default class MemberArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'member');
    }

    public async validate(val: string, msg: CommandoMessage, arg: Argument): Promise<boolean | string> {
        if (!msg.guild) return false;

        const matches = val.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) {
            try {
                const member = await msg.guild.members.fetch(matches[1]);
                if (!member) return false;
                if (arg.oneOf && !arg.oneOf.includes(member.id)) return false;
                return true;
            } catch (err) {
                return false;
            }
        }

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

        return members.size <= 15 ?
            `${Util.disambiguation(members.map(mem => escapeMarkdown(mem.user.tag)), 'members')}\n` :
            'Multiple members found. Please be more specific.';
    }

    public parse(val: string, msg: CommandoMessage): GuildMember | null {
        if (!msg.guild) return null;

        const matches = val.match(/^(?:<@!?)?(\d+)>?$/);
        if (matches) return msg.guild.members.resolve(matches[1]);

        const search = val.toLowerCase();
        const members = msg.guild.members.cache.filter(memberFilterInexact(search));
        if (members.size === 0) return null;
        if (members.size === 1) return members.first() ?? null;

        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.size === 1) return exactMembers.first() ?? null;

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
