import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoCategoryChannel } from '../discord.overrides';
export default class CategoryChannelArgumentType extends ArgumentType<'category-channel'> {
    constructor(client: CommandoClient);
    validate(value: string, message: CommandoMessage, argument: Argument<'category-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): CommandoCategoryChannel | null;
}
