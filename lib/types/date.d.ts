import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';
export default class DateArgumentType extends ArgumentType {
    protected regex: RegExp;
    constructor(client: CommandoClient);
    validate(val: string, _: CommandoMessage, arg: Argument): boolean | string;
    parse(val: string): Date;
    /**
     * Parses the string value into a valid Date object, if possible.
     * @param matches - Matches given by the regex.
     * @param val - The value to parse.
     */
    protected _parseDate(matches: RegExpMatchArray | null, val: string): Date | null;
}
