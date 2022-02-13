/* eslint-disable no-unused-vars */
const ms = require('ms');
const ArgumentType = require('./base');
/* eslint-enable no-unused-vars */

class DateArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'date');

        const empty = '(?:\\s+)?';
        this.regex = new RegExp(
            '^([1-3]?\\d[\\/\\-\\.,][01]?\\d(?:[\\/\\-\\.,]\\d{2})?(?:\\d{2})?)?' + // date
            empty +
            '([0-2]?\\d(?::[0-5]?\\d)?)?' + // time/hour
            empty +
            '([aApP]\\.?[mM]\\.?)?' + // am pm
            empty +
            '([+-]\\d\\d?)?$' // time zone offset
        );
    }

    validate(val, _, arg) {
        const date = this._parseDate(val.match(this.regex)?.slice(1, 5), val);
        if (!date) {
            return 'Please enter a valid date format. Use the `help` command for more information.';
        }
        if (arg.skipValidation) return true;

        const int = date.getTime();
        if (int <= Date.now()) {
            return 'Please enter a date that\'s in the future.';
        }
        if (int > (Date.now() + ms('1y'))) {
            return 'The max. usable date is `1 year` in the future. Please try again.';
        }

        return true;
    }

    parse(val) {
        return this._parseDate(val.match(this.regex)?.slice(1, 5), val);
    }

    /**
     * Parses the string value into a valid Date object, if possible.
     * @param {string[]} matches Matches given by the regex.
     * @param {string} val The value to parse.
     * @private
     */
    _parseDate(matches, val) {
        if (val.toLowerCase() === 'now') return new Date();

        if (!matches) return null;
        if (matches.length === 0) return null;
        const defDate = new Date();

        const dateNums = matches[0]?.split(/[/\-.,]/g).map((s, i) => {
            const parsed = parseInt(s);
            if (i === 0) return parsed;
            if (i === 1) return parsed - 1;
            return (s.length === 2 ? parsed + 2000 : parsed);
        }) || [defDate.getUTCDate(), defDate.getUTCMonth(), defDate.getUTCFullYear()];
        if (dateNums.length === 2) {
            dateNums.push(defDate.getUTCFullYear());
        }
        dateNums.reverse();

        const timeNums = matches[1]?.split(':').map((s, i) => {
            const parsed = parseInt(s);
            if (i !== 0) return parsed;

            const tzOffset = new Date().getTimezoneOffset() / 60;
            const offset = tzOffset + parseInt(matches[3] ?? 0);

            const ampm = matches[2]?.toLowerCase().replace(/\./g, '');
            const formatter = ampm ? (ampm === 'am' ? 0 : 12) : 0;

            if (formatter === 12 && parsed === 12) {
                return parsed - offset;
            }
            return parsed + formatter - offset;
        }) || [defDate.getUTCHours(), defDate.getUTCMinutes()];
        const arr = [...dateNums, ...timeNums].filter(n => typeof n !== 'undefined');
        const date = new Date(...arr);
        return date;
    }
}

module.exports = DateArgumentType;
