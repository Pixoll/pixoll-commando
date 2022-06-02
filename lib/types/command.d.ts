import ArgumentType from './base';
import CommandoClient from '../client';
import Command from '../commands/base';
export default class CommandArgumentType extends ArgumentType {
    constructor(client: CommandoClient);
    validate(val: string): boolean | string;
    parse(val: string): Command;
}
