import ArgumentType from './base';
import CommandoClient from '../client';
import CommandGroup from '../commands/group';
export default class GroupArgumentType extends ArgumentType<'group'> {
    constructor(client: CommandoClient);
    validate(value: string): boolean | string;
    parse(value: string): CommandGroup;
}
