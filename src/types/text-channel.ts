import ArgumentType from './base';
import Util from '../util';
import { ChannelType, escapeMarkdown, GuildBasedChannel, TextChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';

export default class TextChannelArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'text-channel');
    }

    public validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string {
        const matches = val.match(/^(?:<#)?(\d+)>?$/);
        if (matches) {
            try {
                const channel = msg.client.channels.resolve(matches[1]);
                if (!channel || channel.type !== ChannelType.GuildText) return false;
                if (arg.oneOf && !arg.oneOf.includes(channel.id)) return false;
                return true;
            } catch (err) {
                return false;
            }
        }

        if (!msg.guild) return false;

        const search = val.toLowerCase();
        let channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
        const first = channels.first();
        if (!first) return false;
        if (channels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(first.id)) return false;
            return true;
        }

        const exactChannels = channels.filter(channelFilterExact(search));
        const exact = exactChannels.first();
        if (exactChannels.size === 1 && exact) {
            if (arg.oneOf && !arg.oneOf.includes(exact.id)) return false;
            return true;
        }
        if (exactChannels.size > 0) channels = exactChannels;

        return channels.size <= 15 ?
            `${Util.disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'text channels')}\n` :
            'Multiple text channels found. Please be more specific.';
    }

    public parse(val: string, msg: CommandoMessage): TextChannel | null {
        const matches = val.match(/^(?:<#)?(\d+)>?$/);
        if (matches) return msg.client.channels.resolve(matches[1]) as TextChannel;

        if (!msg.guild) return null;

        const search = val.toLowerCase();
        const channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0) return null;
        if (channels.size === 1) return channels.first() ?? null;

        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) return exactChannels.first() ?? null;

        return null;
    }
}

function channelFilterExact(search: string) {
    return (chan: GuildBasedChannel): chan is TextChannel =>
        chan.type === ChannelType.GuildText && chan.name.toLowerCase() === search;
}

function channelFilterInexact(search: string) {
    return (chan: GuildBasedChannel): chan is TextChannel =>
        chan.type === ChannelType.GuildText && chan.name.toLowerCase().includes(search);
}
