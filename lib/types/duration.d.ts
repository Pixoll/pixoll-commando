import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class DurationArgumentType extends ArgumentType {
    constructor(client: CommandoClient);
    validate(val: string, _: CommandoMessage, arg: Argument): boolean | string;
    parse(val: string): number;
}
