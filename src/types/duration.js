const ArgumentType = require('./base');
const ms = require('ms');

class DurationArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'duration');
    }

    validate(val, msg, arg) {
        /** @type {number} */
        const int = typeof val === 'number' ? val : ms(val);

        if (!int || int < 1000) {
            return 'Please enter a valid duration format. Use the `help` command for more information.';
        }

        if (int > ms('1y')) {
            return 'The max. usable duration is `1 year`. Please try again.';
        }

        if (arg.min !== null && typeof arg.min !== 'undefined' && int < arg.min) {
            return `Please enter a duration above or exactly ${ms(arg.min)}.`;
        }
        if (arg.max !== null && typeof arg.max !== 'undefined' && int > arg.max) {
            return `Please enter a duration below or exactly ${ms(arg.max)}.`;
        }

        return true;
    }

    parse(val) {
        if (typeof val === 'number') return val;
        return ms(val);
    }
}

module.exports = DurationArgumentType;
