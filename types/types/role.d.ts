import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoRole } from '../discord.overrides';
export default class RoleArgumentType extends ArgumentType<'role'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'role'>): boolean | string;
    parse(value: string, message: CommandoMessage): CommandoRole | null;
}
