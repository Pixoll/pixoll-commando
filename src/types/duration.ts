import ArgumentType from './base';
import { ms } from 'better-ms';
import CommandoClient from '../client';
import Argument from '../commands/argument';
import Util from '../util';

export default class DurationArgumentType extends ArgumentType<'duration'> {
    public constructor(client: CommandoClient) {
        super(client, 'duration');
    }

    public validate(value: string, _: unknown, arg: Argument<'duration'>): boolean | string {
        const int = typeof value === 'number' ? value
            : /^\d+$/.test(value) ? parseInt(value) : ms(value);

        if (!int || int < 1000) {
            return 'Please enter a valid duration format. Use the `help` command for more information.';
        }

        if (int > ms('1y')) {
            return 'The max. usable duration is `1 year`. Please try again.';
        }

        if (!Util.isNullish(arg.min) && int < arg.min) {
            return `Please enter a duration greater than or exactly to ${ms(arg.min)}.`;
        }
        if (!Util.isNullish(arg.max) && int > arg.max) {
            return `Please enter a duration less than or exactly to ${ms(arg.max)}.`;
        }

        return true;
    }

    public parse(value: string): number {
        if (typeof value === 'number') return value;
        if (/^\d+$/.test(value)) return parseInt(value);
        return ms(value);
    }
}
