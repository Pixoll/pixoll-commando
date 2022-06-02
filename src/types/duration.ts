import ArgumentType from './base';
import ms from 'ms';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';

export default class DurationArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'duration');
    }

    public validate(val: string, _: CommandoMessage, arg: Argument): boolean | string {
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

    public parse(val: string): number {
        if (typeof val === 'number') return val;
        return ms(val);
    }
}
