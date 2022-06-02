import ArgumentType from './base';
import CommandoClient from '../client';
import CommandGroup from '../commands/group';
export default class GroupArgumentType extends ArgumentType {
    constructor(client: CommandoClient);
    validate(val: string): boolean | string;
    parse(val: string): CommandGroup;
}
