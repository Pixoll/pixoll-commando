import ArgumentType from './base';
import { User } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class UserArgumentType extends ArgumentType {
    constructor(client: CommandoClient);
    validate(val: string, msg: CommandoMessage, arg: Argument): Promise<boolean | string>;
    parse(val: string, msg: CommandoMessage): User | null;
}
