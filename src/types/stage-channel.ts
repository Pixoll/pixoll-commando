import ArgumentType from './base';
import Util from '../util';
import { ChannelType, escapeMarkdown, GuildBasedChannel, StageChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';

export default class StageChannelArgumentType extends ArgumentType<'stage-channel'> {
    public constructor(client: CommandoClient) {
        super(client, 'stage-channel');
    }

    public validate(
        value: string | undefined, message: CommandoMessage, argument: Argument<'stage-channel'>
    ): boolean | string {
        if (typeof value === 'undefined') return false;
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) {
            try {
                const channel = message.client.channels.resolve(matches[1]);
                if (!channel || channel.type !== ChannelType.GuildStageVoice) return false;
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
            ? `${Util.disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'stage channels')}\n`
            : 'Multiple stage channels found. Please be more specific.';
    }

    public parse(value: string, message: CommandoMessage): StageChannel | null {
        const matches = value.match(/^(?:<#)?(\d+)>?$/);
        if (matches) return message.client.channels.resolve(matches[1]) as StageChannel | null;

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
    return (channel: GuildBasedChannel): channel is StageChannel =>
        channel.type === ChannelType.GuildStageVoice && channel.name.toLowerCase() === search;
}

function channelFilterInexact(search: string) {
    return (chan: GuildBasedChannel): chan is StageChannel =>
        chan.type === ChannelType.GuildStageVoice && chan.name.toLowerCase().includes(search);
}
