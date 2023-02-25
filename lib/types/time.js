"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const util_1 = __importDefault(require("../util"));
const base_1 = __importDefault(require("./base"));
const timeRegex = new RegExp('(?<time>[0-2]?\\d(?::[0-5]?\\d)?)?\\s*' // time/hour
    + '(?<ampm>[aApP]\\.?[mM]\\.?)?\\s*' // am pm
    + '(?<tz>[+-]\\d\\d?)?$' // time zone offset
);
class TimeArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'time');
    }
    get timeRegex() {
        return timeRegex;
    }
    validate(value) {
        const date = this.parseDate(value.match(this.timeRegex), value);
        if (!date) {
            return 'Please enter a valid date format. Use the `help` command for more information.';
        }
        const int = date.getTime();
        if (int <= Date.now()) {
            return 'Please enter a date that\'s in the future.';
        }
        if (int > (Date.now() + (0, better_ms_1.ms)('1y'))) {
            return 'The max. usable date is `1 year` in the future. Please try again.';
        }
        return true;
    }
    parse(value) {
        return this.parseDate(value.match(this.timeRegex), value);
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
        const { time, ampm: matchAmPm, tz } = matches.groups;
        const defaultDate = new Date();
        const tzOffset = defaultDate.getTimezoneOffset() / 60;
        const offset = tzOffset + parseInt(tz ?? 0);
        const hourFormat = matchAmPm?.toLowerCase().replace(/\./g, '');
        const formatter = hourFormat ? (hourFormat === 'am' ? 0 : 12) : 0;
        const dateNumbers = [defaultDate.getUTCFullYear(), defaultDate.getUTCMonth(), defaultDate.getUTCDate()];
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
exports.default = TimeArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy90aW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUNBQStCO0FBRS9CLG1EQUFzQztBQUN0QyxrREFBa0M7QUFFbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQ3hCLHdDQUF3QyxDQUFDLFlBQVk7TUFDbkQsa0NBQWtDLENBQUMsUUFBUTtNQUMzQyxzQkFBc0IsQ0FBQyxtQkFBbUI7Q0FDL0MsQ0FBQztBQUVGLE1BQXFCLGdCQUFpQixTQUFRLGNBQW9CO0lBQzlELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQVcsU0FBUztRQUNoQixPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQWE7UUFDekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsT0FBTyxnRkFBZ0YsQ0FBQztTQUMzRjtRQUVELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzQixJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDbkIsT0FBTyw0Q0FBNEMsQ0FBQztTQUN2RDtRQUNELElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUEsY0FBRSxFQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDL0IsT0FBTyxtRUFBbUUsQ0FBQztTQUM5RTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBYTtRQUN0QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMs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