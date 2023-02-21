import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';
/** A type for command arguments that handles multiple other types */
export default class ArgumentUnionType extends ArgumentType {
    /** Types to handle, in order of priority */
    types: ArgumentType[];
    constructor(client: CommandoClient, id: string);
    validate(val: string, msg: CommandoMessage, arg: Argument): Promise<boolean | string>;
    parse(val: string, msg: CommandoMessage, arg: Argument): Promise<unknown>;
    isEmpty(val: string, msg: CommandoMessage, arg: Argument): boolean;
}
