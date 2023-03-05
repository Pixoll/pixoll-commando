import CommandoClient from '../client';
import Argument, { ArgumentTypeString, ArgumentTypeStringMap } from '../commands/argument';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';
/** A type for command arguments that handles multiple other types */
export default class ArgumentUnionType<T extends ArgumentTypeString = ArgumentTypeString> extends ArgumentType {
    /** Types to handle, in order of priority */
    types: ArgumentType[];
    constructor(client: CommandoClient, id: string);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string>;
    parse(value: string, message: CommandoMessage, argument: Argument): Promise<ArgumentTypeStringMap[T] | null>;
    isEmpty(value: string, message: CommandoMessage, argument: Argument): boolean;
}
