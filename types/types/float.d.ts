import CommandoClient from '../client';
import Argument from '../commands/argument';
import ArgumentType from './base';
export default class FloatArgumentType extends ArgumentType<'float'> {
    constructor(client: CommandoClient);
    validate(value: string, _: unknown, argument: Argument<'float'>): boolean | string;
    parse(value: string): number;
}
