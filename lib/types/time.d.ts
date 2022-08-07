import CommandoClient from '../client';
import ArgumentType from './base';
export default class TimeArgumentType extends ArgumentType {
    protected timeRegex: RegExp;
    constructor(client: CommandoClient);
    validate(val: string): boolean | string;
    parse(val: string): Date | null;
    /**
     * Parses the string value into a valid Date object, if possible.
     * @param matches - Matches given by the regex.
     * @param val - The value to parse.
     */
    protected _parseDate(matches: RegExpMatchArray | null, val: string): Date | null;
}
