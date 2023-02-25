import CommandoClient from '../client';
import Argument from '../commands/argument';
import ArgumentType from './base';
export default class DefaultEmojiArgumentType extends ArgumentType<'default-emoji'> {
    constructor(client: CommandoClient);
    get emojiRegex(): RegExp;
    validate(value: string, _: unknown, argument: Argument<'default-emoji'>): boolean | string;
    parse(value: string): string;
}
