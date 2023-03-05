import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { AnyCommandoThreadChannel, CommandoGuildBasedChannel } from '../discord.overrides';

export default class ThreadChannelArgumentType extends ArgumentType<'thread-channel'> {
    public constructor(client: CommandoClient) {
        super(client, 'thread-channel');
    }

    public validate(
        value: string | undefined, message: CommandoMessage, argument: Argument<'thread-channel'>
    ): boolean | string {
        if (typeof value === 'undefined') return false;
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) {
            try {
                const channel = message.client.channels.resolve(matches[1]);
                if (!channel || channel.isThread()) return false;
                if (argument.oneOf && !argument.oneOf.includes(channel.id)) return false;
                return true;
            } catch (err) {
                return false;
            }
        }

        if (!message.inGuild()) return false;

        const search = value.toLowerCase();
        let channels = message.guild.channels.cache.filter(channelFilterInexact(search));
        const first = channels.first();
        if (!first) return false;
        if (channels.size === 1) {
            if (argument.oneOf && !argument.oneOf.includes(first.id)) return false;
            return true;
        }

        const exactChannels = channels.filter(channelFilterExact(search));
        const exact = exactChannels.first();
        if (exactChannels.size === 1 && exact) {
            if (argument.oneOf && !argument.oneOf.includes(exact.id)) return false;
            return true;
        }
        if (exactChannels.size > 0) channels = exactChannels;

        return channels.size <= 15
            ? `${Util.disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'thread channels')}\n`
            : 'Multiple thread channels found. Please be more specific.';
    }

    public parse(value: string, message: CommandoMessage): AnyCommandoThreadChannel | null {
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) return message.client.channels.resolve(matches[1]) as AnyCommandoThreadChannel | null;

        if (!message.inGuild()) return null;

        const search = value.toLowerCase();
        const channels = message.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0) return null;
        if (channels.size === 1) return channels.first() ?? null;

        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) return exactChannels.first() ?? null;

        return null;
    }
}

function channelFilterExact(search: string) {
    return (chan: CommandoGuildBasedChannel): chan is AnyCommandoThreadChannel =>
        chan.isThread() && chan.name.toLowerCase() === search;
}

function channelFilterInexact(search: string) {
    return (chan: CommandoGuildBasedChannel): chan is AnyCommandoThreadChannel =>
        chan.isThread() && chan.name.toLowerCase().includes(search);
}
