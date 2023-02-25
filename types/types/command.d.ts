import ArgumentType from './base';
import CommandoClient from '../client';
import Command from '../commands/base';
export default class CommandArgumentType extends ArgumentType<'command'> {
    constructor(client: CommandoClient);
    validate(value: string): boolean | string;
    parse(value: string): Command;
}
