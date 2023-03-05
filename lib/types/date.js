"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const util_1 = __importDefault(require("../util"));
const base_1 = __importDefault(require("./base"));
const dateRegex = new RegExp('^(?<date>[0-3]?\\d[\\/\\-\\.,][01]?\\d(?:[\\/\\-\\.,]\\d{2})?(?:\\d{2})?)?\\s*' // date
    + '(?<time>[0-2]?\\d(?::[0-5]?\\d)?)?\\s*' // time/hour
    + '(?<ampm>[aApP]\\.?[mM]\\.?)?\\s*' // am pm
    + '(?<tz>[+-]\\d\\d?)?$' // time zone offset
);
class DateArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'date');
    }
    get dateRegex() {
        return dateRegex;
    }
    validate(value, _, argument) {
        if (typeof value === 'undefined')
            return false;
        const date = this.parseDate(value.match(this.dateRegex), value);
        if (!date) {
            return 'Please enter a valid date format. Use the `help` command for more information.';
        }
        if (argument.skipExtraDateValidation)
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
        return this.parseDate(val.match(this.dateRegex), val);
    }
    /**
     * Parses the string value into a valid Date object, if possible.
     * @param matches - Matches given by the regex.
     * @param value - The value to parse.
     */
    parseDate(matches, value) {
        if (value.toLowerCase() === 'now')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9kYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUNBQStCO0FBRy9CLG1EQUFzQztBQUN0QyxrREFBa0M7QUFFbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQ3hCLGdGQUFnRixDQUFDLE9BQU87TUFDdEYsd0NBQXdDLENBQUMsWUFBWTtNQUNyRCxrQ0FBa0MsQ0FBQyxRQUFRO01BQzNDLHNCQUFzQixDQUFDLG1CQUFtQjtDQUMvQyxDQUFDO0FBRUYsTUFBcUIsZ0JBQWlCLFNBQVEsY0FBb0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBeUIsRUFBRSxDQUFVLEVBQUUsUUFBMEI7UUFDN0UsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDL0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsT0FBTyxnRkFBZ0YsQ0FBQztTQUMzRjtRQUNELElBQUksUUFBUSxDQUFDLHVCQUF1QjtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRWxELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzQixJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDbkIsT0FBTyw0Q0FBNEMsQ0FBQztTQUN2RDtRQUNELElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElB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