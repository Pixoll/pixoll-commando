import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoTextChannel } from '../discord.overrides';
export default class TextChannelArgumentType extends ArgumentType<'text-channel'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'text-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): CommandoTextChannel | null;
}
