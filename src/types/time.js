const ArgumentType = require('./base');

class TimeArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'time');

        this.regex = new RegExp(
            '(?<time>[0-2]?\\d(?::[0-5]?\\d)?)?\\s*' + // time/hour
            '(?<ampm>[aApP]\\.?[mM]\\.?)?\\s*' + // am pm
            '(?<tz>[+-]\\d\\d?)?$' // time zone offset
        );
    }

    validate(val) {
        const date = this._parseDate(val.match(this.regex), val);
        if (!date) {
            return 'Please enter a valid date format. Use the `help` command for more information.';
        }

        return true;
    }

    parse(val) {
        return this._parseDate(val.match(this.regex), val);
    }

    /**
     * Parses the string value into a valid Date object, if possible.
     * @param {RegExpMatchArray} matches Matches given by the regex.
     * @param {string} val The value to parse.
     * @private
     */
    _parseDate(matches, val) {
        if (val.toLowerCase() === 'now') return new Date();
        if (!matches || Object.values(matches.groups).filter(v => v).length === 0) return null;

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

        const arr = [...dateNumbers, ...timeNumbers].filter(n => typeof n !== 'undefined');
        const date = new Date(...arr);
        return date;
    }
}

module.exports = TimeArgumentType;
