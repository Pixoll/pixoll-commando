import CommandoClient from '../client';
import Argument from '../commands/argument';
import Util from '../util';
import ArgumentType from './base';

export default class IntegerArgumentType extends ArgumentType<'integer'> {
    public constructor(client: CommandoClient) {
        super(client, 'integer');
    }

    public validate(value: string, _: unknown, argument: Argument<'integer'>): boolean | string {
        const int = parseInt(value);
        if (isNaN(int)) return false;

        if (argument.oneOf && !argument.oneOf.includes(int)) {
            return `Please enter one of the following options: ${argument.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (!Util.isNullish(argument.min) && int < argument.min) {
            return `Please enter a number above or exactly ${argument.min}.`;
        }
        if (!Util.isNullish(argument.max) && int > argument.max) {
            return `Please enter a number below or exactly ${argument.max}.`;
        }

        return true;
    }

    public parse(value: string): number {
        return parseInt(value);
    }
}
