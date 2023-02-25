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
    validate(val, _, arg) {
        const date = this.parseDate(val.match(this.dateRegex), val);
        if (!date) {
            return 'Please enter a valid date format. Use the `help` command for more information.';
        }
        if (arg.skipExtraDateValidation)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9kYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUNBQStCO0FBRy9CLG1EQUFzQztBQUN0QyxrREFBa0M7QUFFbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQ3hCLGdGQUFnRixDQUFDLE9BQU87TUFDdEYsd0NBQXdDLENBQUMsWUFBWTtNQUNyRCxrQ0FBa0MsQ0FBQyxRQUFRO01BQzNDLHNCQUFzQixDQUFDLG1CQUFtQjtDQUMvQyxDQUFDO0FBRUYsTUFBcUIsZ0JBQWlCLFNBQVEsY0FBb0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxRQUFRLENBQUMsR0FBVyxFQUFFLENBQVUsRUFBRSxHQUFxQjtRQUMxRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxPQUFPLGdGQUFnRixDQUFDO1NBQzNGO1FBQ0QsSUFBSSxHQUFHLENBQUMsdUJBQXVCO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFN0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzNCLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNuQixPQUFPLDRDQUE0QyxDQUFDO1NBQ3ZEO1FBQ0QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBQSxjQUFFLEVBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtZQUMvQixPQUFPLG1FQUFtRSxD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