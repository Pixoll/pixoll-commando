import ArgumentType from './base';
import CommandoClient from '../client';
import Argument from '../commands/argument';
export default class DurationArgumentType extends ArgumentType<'duration'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, _: unknown, argument: Argument<'duration'>): boolean | string;
    parse(value: string): number;
}
