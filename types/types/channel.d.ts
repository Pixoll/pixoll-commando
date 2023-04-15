import ArgumentType from './base';
import { GuildBasedChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class ChannelArgumentType extends ArgumentType<'channel'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): GuildBasedChannel | null;
}
