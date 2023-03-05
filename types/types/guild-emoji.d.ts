import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import { CommandoGuildEmoji } from '../discord.overrides';
export default class CustomEmojiArgumentType extends ArgumentType<'guild-emoji'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage): boolean | string;
    parse(value: string, message: CommandoMessage): CommandoGuildEmoji | null;
}
