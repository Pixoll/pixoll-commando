import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoGuildMember } from '../discord.overrides';
export default class MemberArgumentType extends ArgumentType<'member'> {
    constructor(client: CommandoClient);
    validate(value: string, message: CommandoMessage, argument: Argument<'member'>): Promise<boolean | string>;
    parse(value: string, message: CommandoMessage): CommandoGuildMember | null;
}
