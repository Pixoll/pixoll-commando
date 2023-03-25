import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoNewsChannel } from '../discord.overrides';
export default class NewsChannelArgumentType extends ArgumentType<'news-channel'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'news-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): CommandoNewsChannel | null;
}
