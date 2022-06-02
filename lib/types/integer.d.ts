import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';
export default class IntegerArgumentType extends ArgumentType {
    constructor(client: CommandoClient);
    validate(val: string, _: CommandoMessage, arg: Argument): boolean | string;
    parse(val: string): number;
}
