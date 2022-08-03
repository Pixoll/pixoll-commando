import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';
import Util from '../util';
import ArgumentType from './base';

export default class StringArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'string');
    }

    public validate(val: string, _: CommandoMessage, arg: Argument): boolean | string {
        if (arg.oneOf && !arg.oneOf.includes(val.toLowerCase())) {
            return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (!Util.isNullish(arg.min) && val.length < arg.min) {
            return `Please keep the ${arg.label} above or exactly ${arg.min} characters.`;
        }
        if (!Util.isNullish(arg.max) && val.length > arg.max) {
            return `Please keep the ${arg.label} below or exactly ${arg.max} characters.`;
        }

        return true;
    }

    public parse(val: string): string {
        return val;
    }
}
