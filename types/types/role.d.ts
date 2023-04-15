import ArgumentType from './base';
import { Role } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class RoleArgumentType extends ArgumentType<'role'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'role'>): boolean | string;
    parse(value: string, message: CommandoMessage): Role | null;
}
