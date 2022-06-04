import ArgumentType from './base';
import Util from '../util';
import { GuildBasedChannel, TextChannel, Util as DjsUtil } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';

export default class TextChannelArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'text-channel');
    }

    public validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) {
            try {
                const channel = msg.client.channels.resolve(matches[1]);
                if (!channel || channel.type !== 'GUILD_TEXT') return false;
                if (arg.oneOf && !arg.oneOf.includes(channel.id)) return false;
                return true;
            } catch (err) {
                return false;
            }
        }

        if (!msg.guild) return false;

        const search = val.toLowerCase();
        let channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0) return false;
        if (channels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(channels.first()!.id)) return false;
            return true;
        }

        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(exactChannels.first()!.id)) return false;
            return true;
        }
        if (exactChannels.size > 0) channels = exactChannels;

        return channels.size <= 15 ?
            `${Util.disambiguation(channels.map(chan => DjsUtil.escapeMarkdown(chan.name)), 'text channels')}\n` :
            'Multiple text channels found. Please be more specific.';
    }

    public parse(val: string, msg: CommandoMessage): TextChannel | null {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) return msg.client.channels.resolve(matches[1]) as TextChannel || null;

        if (!msg.guild) return null;

        const search = val.toLowerCase();
        const channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0) return null;
        if (channels.size === 1) return channels.first() as TextChannel;

        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) return exactChannels.first() as TextChannel;

        return null;
    }
}

function channelFilterExact(search: string) {
    return (chan: GuildBasedChannel) => chan.type === 'GUILD_TEXT' && chan.name.toLowerCase() === search;
}

function channelFilterInexact(search: string) {
    return (chan: GuildBasedChannel) => chan.type === 'GUILD_TEXT' && chan.name.toLowerCase().includes(search);
}
