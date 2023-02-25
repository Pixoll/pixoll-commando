import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import { CommandoGuildEmoji } from '../discord.overrides';

export default class CustomEmojiArgumentType extends ArgumentType<'guild-emoji'> {
    public constructor(client: CommandoClient) {
        super(client, 'guild-emoji');
    }

    public validate(value: string, msg: CommandoMessage): boolean | string {
        const matches = value.match(/^(?:<a?:(\w+):)?(\d+)>?$/);
        if (matches && msg.client.emojis.cache.has(matches[2])) return true;

        if (!msg.guild) return false;

        const search = value.toLowerCase();
        let emojis = msg.guild.emojis.cache.filter(nameFilterInexact(search));
        if (!emojis.size) return false;
        if (emojis.size === 1) return true;

        const exactEmojis = emojis.filter(nameFilterExact(search));
        if (exactEmojis.size === 1) return true;
        if (exactEmojis.size > 0) emojis = exactEmojis;

        return emojis.size <= 15
            ? `${Util.disambiguation(emojis.map(emoji => escapeMarkdown(emoji.name as string)), 'emojis')}\n`
            : 'Multiple emojis found. Please be more specific.';
    }

    public parse(value: string, message: CommandoMessage): CommandoGuildEmoji | null {
        if (!message.inGuild()) return null;

        const matches = value.match(/^(?:<a?:(\w+):)?(\d+)>?$/);
        if (matches) return message.client.emojis.resolve(matches[2]);

        const search = value.toLowerCase();
        const emojis = message.guild.emojis.cache.filter(nameFilterInexact(search));
        if (!emojis.size) return null;
        if (emojis.size === 1) return emojis.first() ?? null;

        const exactEmojis = emojis.filter(nameFilterExact(search));
        if (exactEmojis.size === 1) return exactEmojis.first() ?? null;

        return null;
    }
}

function nameFilterExact(search: string) {
    return (emoji: CommandoGuildEmoji): boolean => emoji.name?.toLowerCase() === search;
}

function nameFilterInexact(search: string) {
    return (emoji: CommandoGuildEmoji): boolean => !!emoji.name?.toLowerCase().includes(search);
}
