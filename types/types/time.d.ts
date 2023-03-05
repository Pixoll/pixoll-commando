import CommandoClient from '../client';
import ArgumentType from './base';
export default class TimeArgumentType extends ArgumentType<'time'> {
    constructor(client: CommandoClient);
    get timeRegex(): RegExp;
    validate(value: string | undefined): boolean | string;
    parse(value: string): Date | null;
    /**
     * Parses the string value into a valid Date object, if possible.
     * @param matches - Matches given by the regex.
     * @param value - The value to parse.
     */
    parseDate(matches: RegExpMatchArray | null, value: string): Date | null;
}
