import CommandoClient from '../client';
import { CommandoifiedMessage } from '../discord.overrides';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';
export default class MessageArgumentType extends ArgumentType<'message'> {
    constructor(client: CommandoClient);
    get messageRegex(): RegExp;
    validate(value: string | undefined, message: CommandoMessage): Promise<boolean | string>;
    parse(value: string, message: CommandoMessage): CommandoifiedMessage | null;
}
