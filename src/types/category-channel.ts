import ArgumentType from './base';
import Util from '../util';
import { ChannelType, escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoCategoryChannel, CommandoGuildBasedChannel } from '../discord.overrides';

export default class CategoryChannelArgumentType extends ArgumentType<'category-channel'> {
    public constructor(client: CommandoClient) {
        super(client, 'category-channel');
    }

    public validate(value: string, message: CommandoMessage, argument: Argument<'category-channel'>): boolean | string {
        const { client, guild } = message;
        const { oneOf } = argument;

        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) {
            try {
                const channel = client.channels.resolve(matches[1]);
                if (!channel || channel.type !== ChannelType.GuildCategory) return false;
                if (!oneOf?.includes(channel.id)) return false;
                return true;
            } catch (err) {
                return false;
            }
        }

        if (!guild) return false;

        const search = value.toLowerCase();
        let channels = guild.channels.cache.filter(channelFilterInexact(search));
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
            ? `${Util.disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'categories')}\n`
            : 'Multiple categories found. Please be more specific.';
    }

    public parse(value: string, message: CommandoMessage): CommandoCategoryChannel | null {
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) return message.client.channels.resolve(matches[1]) as CommandoCategoryChannel | null;

        if (!message.guild) return null;

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
    return (channel: CommandoGuildBasedChannel): channel is CommandoCategoryChannel =>
        channel.type === ChannelType.GuildCategory && channel.name.toLowerCase() === search;
}

function channelFilterInexact(search: string) {
    return (channel: CommandoGuildBasedChannel): channel is CommandoCategoryChannel =>
        channel.type === ChannelType.GuildCategory && channel.name.toLowerCase().includes(search);
}
