import ArgumentType from './base';
import { User } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class UserArgumentType extends ArgumentType<'user'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'user'>): Promise<boolean | string>;
    parse(value: string, message: CommandoMessage): User | null;
}
