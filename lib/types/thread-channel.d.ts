import ArgumentType from './base';
import { ThreadChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class ThreadChannelArgumentType extends ArgumentType {
    constructor(client: CommandoClient);
    validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string;
    parse(val: string, msg: CommandoMessage): ThreadChannel | null;
}
