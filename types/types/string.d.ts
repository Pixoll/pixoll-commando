import CommandoClient from '../client';
import Argument from '../commands/argument';
import ArgumentType from './base';
export default class StringArgumentType extends ArgumentType<'string'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, _: unknown, argument: Argument<'string'>): boolean | string;
    parse(value: string): string;
}
