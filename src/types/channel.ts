import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown, GuildBasedChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';

export default class ChannelArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'channel');
    }

    public validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string {
        if (!msg.guild) return false;

        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) return msg.guild.channels.cache.has(matches[1]);

        const search = val.toLowerCase();
        let channels = msg.guild.channels.cache.filter(nameFilterInexact(search));
        if (channels.size === 0) return false;
        if (channels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(channels.first()!.id)) return false;
            return true;
        }

        const exactChannels = channels.filter(nameFilterExact(search));
        if (exactChannels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(exactChannels.first()!.id)) return false;
            return true;
        }
        if (exactChannels.size > 0) channels = exactChannels;

        return channels.size <= 15 ?
            `${Util.disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'channels')}\n` :
            'Multiple channels found. Please be more specific.';
    }

    public parse(val: string, msg: CommandoMessage): GuildBasedChannel | null {
        if (!msg.guild) return null;

        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) return msg.guild.channels.cache.get(matches[1]) ?? null;

        const search = val.toLowerCase();
        const channels = msg.guild.channels.cache.filter(nameFilterInexact(search));
        if (channels.size === 0) return null;
        if (channels.size === 1) return channels.first()!;

        const exactChannels = channels.filter(nameFilterExact(search));
        if (exactChannels.size === 1) return exactChannels.first()!;

        return null;
    }
}

function nameFilterExact(search: string) {
    return (chan: GuildBasedChannel): boolean => chan.name.toLowerCase() === search;
}

function nameFilterInexact(search: string) {
    return (chan: GuildBasedChannel): boolean => chan.name.toLowerCase().includes(search);
}
