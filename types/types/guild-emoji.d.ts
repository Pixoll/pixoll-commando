import ArgumentType from './base';
import { GuildEmoji } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
export default class CustomEmojiArgumentType extends ArgumentType<'guild-emoji'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage): boolean | string;
    parse(value: string, message: CommandoMessage): GuildEmoji | null;
}
