import CommandoClient from '../client';
import Argument from '../commands/argument';
import ArgumentType from './base';
export default class IntegerArgumentType extends ArgumentType<'integer'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, _: unknown, argument: Argument<'integer'>): boolean | string;
    parse(value: string): number;
}
