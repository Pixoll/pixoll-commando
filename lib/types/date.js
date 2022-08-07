"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const util_1 = __importDefault(require("../util"));
const base_1 = __importDefault(require("./base"));
class DateArgumentType extends base_1.default {
    dateRegex;
    constructor(client) {
        super(client, 'date');
        this.dateRegex = new RegExp('^(?<date>[1-3]?\\d[\\/\\-\\.,][01]?\\d(?:[\\/\\-\\.,]\\d{2})?(?:\\d{2})?)?\\s*' // date
            + '(?<time>[0-2]?\\d(?::[0-5]?\\d)?)?\\s*' // time/hour
            + '(?<ampm>[aApP]\\.?[mM]\\.?)?\\s*' // am pm
            + '(?<tz>[+-]\\d\\d?)?$' // time zone offset
        );
    }
    validate(val, _, arg) {
        const date = this._parseDate(val.match(this.dateRegex), val);
        if (!date) {
            return 'Please enter a valid date format. Use the `help` command for more information.';
        }
        if (arg.skipValidation)
            return true;
        const int = date.getTime();
        if (int <= Date.now()) {
            return 'Please enter a date that\'s in the future.';
        }
        if (int > (Date.now() + (0, better_ms_1.ms)('1y'))) {
            return 'The max. usable date is `1 year` in the future. Please try again.';
        }
        return true;
    }
    parse(val) {
        return this._parseDate(val.match(this.dateRegex), val);
    }
    /**
     * Parses the string value into a valid Date object, if possible.
     * @param matches - Matches given by the regex.
     * @param val - The value to parse.
     */
    _parseDate(matches, val) {
        if (val.toLowerCase() === 'now')
            return new Date();
        if (!matches || !matches.groups || Object.values(matches.groups).filter(v => v).length === 0)
            return null;
        const { date: matchDate, time, ampm: matchAmPm, tz } = matches.groups;
        const defaultDate = new Date();
        const tzOffset = defaultDate.getTimezoneOffset() / 60;
        const offset = tzOffset + parseInt(tz ?? 0);
        const hourFormat = matchAmPm?.toLowerCase().replace(/\./g, '');
        const formatter = hourFormat ? (hourFormat === 'am' ? 0 : 12) : 0;
        const defaultYear = defaultDate.getUTCFullYear();
        const dateNumbers = matchDate?.split(/[/\-.,]/g)
            .map((n, i) => {
            const parsed = parseInt(n);
            if (i === 0)
                return parsed;
            if (i === 1)
                return parsed - 1;
            return (n.length === 2 ? parsed + 2000 : parsed);
        })
            || [defaultDate.getUTCDate(), defaultDate.getUTCMonth(), defaultYear];
        if (dateNumbers.length === 2) {
            dateNumbers.push(defaultYear);
        }
        dateNumbers.reverse();
        const timeNumbers = time?.split(':')
            .map((n, i) => {
            const parsed = parseInt(n);
            if (i !== 0)
                return parsed;
            if (formatter === 12 && parsed === 12)
                return parsed - offset;
            return parsed + formatter - offset;
        })
            || [defaultDate.getUTCHours(), defaultDate.getUTCMinutes()];
        const arr = dateNumbers.concat(timeNumbers)
            .filter(n => !util_1.default.isNullish(n));
        const date = new Date(...arr);
        return date;
    }
}
exports.default = DateArgumentType;
//# sourceMappingURL=date.js.map