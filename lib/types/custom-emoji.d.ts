import ArgumentType from './base';
import { GuildEmoji } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
export default class CustomEmojiArgumentType extends ArgumentType {
    constructor(client: CommandoClient);
    validate(value: string, msg: CommandoMessage): boolean | string;
    parse(value: string, msg: CommandoMessage): GuildEmoji | null;
}
