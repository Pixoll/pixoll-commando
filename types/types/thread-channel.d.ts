import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { AnyCommandoThreadChannel } from '../discord.overrides';
export default class ThreadChannelArgumentType extends ArgumentType<'thread-channel'> {
    constructor(client: CommandoClient);
    validate(value: string, message: CommandoMessage, argument: Argument<'thread-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): AnyCommandoThreadChannel | null;
}
