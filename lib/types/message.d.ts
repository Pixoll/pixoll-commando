import { Message } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';
export default class MessageArgumentType extends ArgumentType {
    constructor(client: CommandoClient);
    validate(val: string, msg: CommandoMessage): Promise<boolean>;
    parse(val: string, msg: CommandoMessage): Message | null;
}
