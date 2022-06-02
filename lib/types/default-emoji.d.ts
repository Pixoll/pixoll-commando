import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';
export default class DefaultEmojiArgumentType extends ArgumentType {
    protected emojiRegex: RegExp;
    constructor(client: CommandoClient);
    validate(value: string, _: CommandoMessage, arg: Argument): boolean | string;
    parse(value: string): string;
}
