import ArgumentType from './base';
import { ms } from 'better-ms';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import Util from '../util';

export default class DurationArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'duration');
    }

    public validate(val: string, _: CommandoMessage, arg: Argument): boolean | string {
        const int = typeof val === 'number' ? val :
            /^\d+$/.test(val) ? parseInt(val) : ms(val);

        if (!int || int < 1000) {
            return 'Please enter a valid duration format. Use the `help` command for more information.';
        }

        if (int > ms('1y')) {
            return 'The max. usable duration is `1 year`. Please try again.';
        }

        if (!Util.isNullish(arg.min) && int < arg.min) {
            return `Please enter a duration above or exactly ${ms(arg.min)}.`;
        }
        if (!Util.isNullish(arg.max) && int > arg.max) {
            return `Please enter a duration below or exactly ${ms(arg.max)}.`;
        }

        return true;
    }

    public parse(val: string): number {
        if (typeof val === 'number') return val;
        if (/^\d+$/.test(val)) return parseInt(val);
        return ms(val);
    }
}
