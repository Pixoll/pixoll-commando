import CommandoClient from '../client';
import Argument from '../commands/argument';
import ArgumentType from './base';
export default class DateArgumentType extends ArgumentType<'date'> {
    constructor(client: CommandoClient);
    get dateRegex(): RegExp;
    validate(value: string | undefined, _: unknown, argument: Argument<'date'>): boolean | string;
    parse(val: string): Date | null;
    /**
     * Parses the string value into a valid Date object, if possible.
     * @param matches - Matches given by the regex.
     * @param value - The value to parse.
     */
    parseDate(matches: RegExpMatchArray | null, value: string): Date | null;
}
