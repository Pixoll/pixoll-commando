import ArgumentType from './base';
import Util from '../util';
import { CategoryChannel, GuildBasedChannel, Util as DjsUtil } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';

export default class CategoryChannelArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'category-channel');
    }

    public validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string {
        const { client, guild } = msg;
        const { oneOf } = arg;

        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) {
            try {
                const channel = client.channels.resolve(matches[1]);
                if (!channel || channel.type !== 'GUILD_CATEGORY') return false;
                if (!oneOf?.includes(channel.id)) return false;
                return true;
            } catch (err) {
                return false;
            }
        }

        if (!guild) return false;

        const search = val.toLowerCase();
        let channels = guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0) return false;
        if (channels.size === 1) {
            if (!oneOf?.includes(channels.first()!.id)) return false;
            return true;
        }

        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) {
            if (!oneOf?.includes(exactChannels.first()!.id)) return false;
            return true;
        }
        if (exactChannels.size > 0) channels = exactChannels;

        return channels.size <= 15 ?
            `${Util.disambiguation(channels.map(chan => DjsUtil.escapeMarkdown(chan.name)), 'categories')}\n` :
            'Multiple categories found. Please be more specific.';
    }

    public parse(val: string, msg: CommandoMessage): CategoryChannel | null {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) return msg.client.channels.resolve(matches[1]) as CategoryChannel ?? null;

        if (!msg.guild) return null;

        const search = val.toLowerCase();
        const channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
        if (channels.size === 0) return null;
        if (channels.size === 1) return channels.first() as CategoryChannel;

        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) return exactChannels.first() as CategoryChannel;

        return null;
    }
}

function channelFilterExact(search: string) {
    return (chan: GuildBasedChannel) => chan.type === 'GUILD_CATEGORY' && chan.name.toLowerCase() === search;
}

function channelFilterInexact(search: string) {
    return (chan: GuildBasedChannel) => chan.type === 'GUILD_CATEGORY' && chan.name.toLowerCase().includes(search);
}
