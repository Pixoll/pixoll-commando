import ArgumentType from './base';
import { GuildBasedChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class ChannelArgumentType extends ArgumentType {
    constructor(client: CommandoClient);
    validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string;
    parse(val: string, msg: CommandoMessage): GuildBasedChannel | null;
}
