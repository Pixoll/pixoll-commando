import emojiRegex from 'emoji-regex';
import CommandoClient from '../client';
import Argument from '../commands/argument';
import ArgumentType from './base';

export default class DefaultEmojiArgumentType extends ArgumentType<'default-emoji'> {
    public constructor(client: CommandoClient) {
        super(client, 'default-emoji');
    }

    public get emojiRegex(): RegExp {
        return new RegExp(`^(?:${emojiRegex().source})$`);
    }

    public validate(value: string | undefined, _: unknown, argument: Argument<'default-emoji'>): boolean | string {
        if (typeof value === 'undefined' || !this.emojiRegex.test(value)) return false;
        if (argument.oneOf && !argument.oneOf.includes(value)) {
            return `Please enter one of the following options: ${argument.oneOf.join(' | ')}`;
        }
        return true;
    }

    public parse(value: string): string {
        return value;
    }
}
