import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';
import Util from '../util';
import ArgumentType from './base';

export default class FloatArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'float');
    }

    public validate(val: string, _: CommandoMessage, arg: Argument): boolean | string {
        const float = parseFloat(val);
        if (isNaN(float)) return false;

        if (arg.oneOf && !arg.oneOf.includes(float)) {
            return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (!Util.isNullish(arg.min) && float < arg.min) {
            return `Please enter a number above or exactly ${arg.min}.`;
        }
        if (!Util.isNullish(arg.max) && float > arg.max) {
            return `Please enter a number below or exactly ${arg.max}.`;
        }

        return true;
    }

    public parse(val: string): number {
        return parseFloat(val);
    }
}
