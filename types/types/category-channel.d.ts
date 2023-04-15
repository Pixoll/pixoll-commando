import ArgumentType from './base';
import { CategoryChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class CategoryChannelArgumentType extends ArgumentType<'category-channel'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'category-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): CategoryChannel | null;
}
