import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoGuildBasedChannel } from '../discord.overrides';

export default class ChannelArgumentType extends ArgumentType<'channel'> {
    public constructor(client: CommandoClient) {
        super(client, 'channel');
    }

    public validate(value: string | undefined, message: CommandoMessage, argument: Argument<'channel'>): boolean | string {
        if (typeof value === 'undefined' || !message.inGuild()) return false;

        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) return message.guild.channels.cache.has(matches[1]);

        const search = value.toLowerCase();
        let channels = message.guild.channels.cache.filter(nameFilterInexact(search));
        const first = channels.first();
        if (!first) return false;
        if (channels.size === 1) {
            if (argument.oneOf && !argument.oneOf.includes(first.id)) return false;
            return true;
        }

        const exactChannels = channels.filter(nameFilterExact(search));
        const exact = exactChannels.first();
        if (exactChannels.size === 1 && exact) {
            if (argument.oneOf && !argument.oneOf.includes(exact.id)) return false;
            return true;
        }
        if (exactChannels.size > 0) channels = exactChannels;

        return channels.size <= 15
            ? `${Util.disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'channels')}\n`
            : 'Multiple channels found. Please be more specific.';
    }

    public parse(value: string, message: CommandoMessage): CommandoGuildBasedChannel | null {
        if (!message.inGuild()) return null;

        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) return message.guild.channels.resolve(matches[1]);

        const search = value.toLowerCase();
        const channels = message.guild.channels.cache.filter(nameFilterInexact(search));
        if (channels.size === 0) return null;
        if (channels.size === 1) return channels.first() ?? null;

        const exactChannels = channels.filter(nameFilterExact(search));
        if (exactChannels.size === 1) return exactChannels.first() ?? null;

        return null;
    }
}

function nameFilterExact(search: string) {
    return (channel: CommandoGuildBasedChannel): boolean => channel.name.toLowerCase() === search;
}

function nameFilterInexact(search: string) {
    return (channel: CommandoGuildBasedChannel): boolean => channel.name.toLowerCase().includes(search);
}
