import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoGuildBasedChannel } from '../discord.overrides';
export default class ChannelArgumentType extends ArgumentType<'channel'> {
    constructor(client: CommandoClient);
    validate(value: string, message: CommandoMessage, argument: Argument<'channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): CommandoGuildBasedChannel | null;
}
