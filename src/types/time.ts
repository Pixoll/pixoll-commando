import CommandoClient from '../client';
import Util from '../util';
import ArgumentType from './base';

export default class TimeArgumentType extends ArgumentType {
    protected regex: RegExp;

    public constructor(client: CommandoClient) {
        super(client, 'time');

        this.regex = new RegExp(
            '(?<time>[0-2]?\\d(?::[0-5]?\\d)?)?\\s*' // time/hour
            + '(?<ampm>[aApP]\\.?[mM]\\.?)?\\s*' // am pm
            + '(?<tz>[+-]\\d\\d?)?$' // time zone offset
        );
    }

    public validate(val: string): boolean | string {
        const date = this._parseDate(val.match(this.regex), val);
        if (!date) {
            return 'Please enter a valid date format. Use the `help` command for more information.';
        }

        return true;
    }

    public parse(val: string): Date {
        return this._parseDate(val.match(this.regex), val)!;
    }

    /**
     * Parses the string value into a valid Date object, if possible.
     * @param matches - Matches given by the regex.
     * @param val - The value to parse.
     */
    protected _parseDate(matches: RegExpMatchArray | null, val: string): Date | null {
        if (val.toLowerCase() === 'now') return new Date();
        if (!matches || !matches.groups || Object.values(matches.groups).filter(v => v).length === 0) return null;

        const { time, ampm: matchAmPm, tz } = matches.groups;
        const defaultDate = new Date();

        const dateNumbers = [defaultDate.getUTCFullYear(), defaultDate.getUTCMonth(), defaultDate.getUTCDate()];

        const timeNumbers = time?.split(':').map((s, i) => {
            const parsed = parseInt(s);
            if (i !== 0) return parsed;

            const tzOffset = new Date().getTimezoneOffset() / 60;
            const offset = tzOffset + parseInt(tz ?? 0);

            const ampm = matchAmPm?.toLowerCase().replace(/\./g, '');
            const formatter = ampm ? (ampm === 'am' ? 0 : 12) : 0;

            if (formatter === 12 && parsed === 12) {
                return parsed - offset;
            }
            return parsed + formatter - offset;
        }) || [defaultDate.getUTCHours(), defaultDate.getUTCMinutes()];

        const arr = [...dateNumbers, ...timeNumbers].filter(n => !Util.isNullish(n));
        const date = new Date(...(arr as [number, number, number, number, number]));
        return date;
    }
}
