import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoUser } from '../discord.overrides';
export default class UserArgumentType extends ArgumentType<'user'> {
    constructor(client: CommandoClient);
    validate(value: string, message: CommandoMessage, argument: Argument<'user'>): Promise<boolean | string>;
    parse(value: string, message: CommandoMessage): CommandoUser | null;
}
