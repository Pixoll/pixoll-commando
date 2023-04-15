import ArgumentType from './base';
import { GuildMember } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class MemberArgumentType extends ArgumentType<'member'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'member'>): Promise<boolean | string>;
    parse(value: string, message: CommandoMessage): GuildMember | null;
}
