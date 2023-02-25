import { ms } from 'better-ms';
import CommandoClient from '../client';
import Util, { Tuple } from '../util';
import ArgumentType from './base';

const timeRegex = new RegExp(
    '(?<time>[0-2]?\\d(?::[0-5]?\\d)?)?\\s*' // time/hour
    + '(?<ampm>[aApP]\\.?[mM]\\.?)?\\s*' // am pm
    + '(?<tz>[+-]\\d\\d?)?$' // time zone offset
);

export default class TimeArgumentType extends ArgumentType<'time'> {
    public constructor(client: CommandoClient) {
        super(client, 'time');
    }

    public get timeRegex(): RegExp {
        return timeRegex;
    }

    public validate(value: string): boolean | string {
        const date = this.parseDate(value.match(this.timeRegex), value);
        if (!date) {
            return 'Please enter a valid date format. Use the `help` command for more information.';
        }

        const int = date.getTime();
        if (int <= Date.now()) {
            return 'Please enter a date that\'s in the future.';
        }
        if (int > (Date.now() + ms('1y'))) {
            return 'The max. usable date is `1 year` in the future. Please try again.';
        }

        return true;
    }

    public parse(value: string): Date | null {
        return this.parseDate(value.match(this.timeRegex), value);
    }

    /**
     * Parses the string value into a valid Date object, if possible.
     * @param matches - Matches given by the regex.
     * @param value - The value to parse.
     */
    public parseDate(matches: RegExpMatchArray | null, value: string): Date | null {
        if (value.toLowerCase() === 'now') return new Date();
        if (!matches || !matches.groups || Object.values(matches.groups).filter(v => v).length === 0) return null;

        const { time, ampm: matchAmPm, tz } = matches.groups;
        const defaultDate = new Date();
        const tzOffset = defaultDate.getTimezoneOffset() / 60;
        const offset = tzOffset + parseInt(tz ?? 0);

        const hourFormat = matchAmPm?.toLowerCase().replace(/\./g, '') as 'am' | 'pm' | undefined;
        const formatter = hourFormat ? (hourFormat === 'am' ? 0 : 12) : 0;

        const dateNumbers = [defaultDate.getUTCFullYear(), defaultDate.getUTCMonth(), defaultDate.getUTCDate()];

        const timeNumbers = time?.split(':')
            .map((n, i) => {
                const parsed = parseInt(n);
                if (i !== 0) return parsed;
                if (formatter === 12 && parsed === 12) return parsed - offset;
                return parsed + formatter - offset;
            })
            || [defaultDate.getUTCHours(), defaultDate.getUTCMinutes()];

        const arr = dateNumbers.concat(timeNumbers)
            .filter(n => !Util.isNullish(n)) as Tuple<number, 5>;

        const date = new Date(...arr);
        return date;
    }
}
