import CommandoClient from '../client';
import Argument from '../commands/argument';
import Util from '../util';
import ArgumentType from './base';

export default class StringArgumentType extends ArgumentType<'string'> {
    public constructor(client: CommandoClient) {
        super(client, 'string');
    }

    public validate(value: string | undefined, _: unknown, argument: Argument<'string'>): boolean | string {
        if (typeof value === 'undefined') return false;
        if (argument.oneOf && !argument.oneOf.includes(value.toLowerCase())) {
            return `Please enter one of the following options: ${argument.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (!Util.isNullish(argument.min) && value.length < argument.min) {
            return `Please keep the ${argument.label} above or exactly ${argument.min} characters.`;
        }
        if (!Util.isNullish(argument.max) && value.length > argument.max) {
            return `Please keep the ${argument.label} below or exactly ${argument.max} characters.`;
        }

        return true;
    }

    public parse(value: string): string {
        return value;
    }
}
