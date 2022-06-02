import emojiRegex from 'emoji-regex';
import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';

export default class DefaultEmojiArgumentType extends ArgumentType {
    protected emojiRegex: RegExp;

    public constructor(client: CommandoClient) {
        super(client, 'default-emoji');
        this.emojiRegex = new RegExp(`^(?:${emojiRegex().source})$`);
    }

    public validate(value: string, _: CommandoMessage, arg: Argument): boolean | string {
        if (!this.emojiRegex.test(value)) return false;
        if (arg.oneOf && !arg.oneOf.includes(value)) {
            return `Please enter one of the following options: ${arg.oneOf.join(' | ')}`;
        }
        return true;
    }

    public parse(value: string): string {
        return value;
    }
}
