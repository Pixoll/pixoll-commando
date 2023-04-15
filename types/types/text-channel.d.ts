import ArgumentType from './base';
import { TextChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class TextChannelArgumentType extends ArgumentType<'text-channel'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'text-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): TextChannel | null;
}
