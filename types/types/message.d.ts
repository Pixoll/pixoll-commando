import CommandoClient from '../client';
import { CommandoifiedMessage } from '../discord.overrides';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';
export default class MessageArgumentType extends ArgumentType<'message'> {
    protected msgRegex: RegExp;
    constructor(client: CommandoClient);
    validate(value: string, message: CommandoMessage): Promise<boolean | string>;
    parse(value: string, message: CommandoMessage): CommandoifiedMessage | null;
}
