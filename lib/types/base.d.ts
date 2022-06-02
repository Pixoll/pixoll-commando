import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';
/** A type for command arguments */
export default abstract class ArgumentType {
    /** Client that this argument type is for */
    readonly client: CommandoClient;
    /** ID of this argument type (this is what you specify in {@link ArgumentInfo#type}) */
    id: string;
    /**
     * @param client - The client the argument type is for
     * @param id - The argument type ID (this is what you specify in {@link ArgumentInfo#type})
     */
    constructor(client: CommandoClient, id: string);
    /**
     * Validates a value string against the type
     * @param val - Value to validate
     * @param originalMsg - Message that triggered the command
     * @param arg - Argument the value was obtained from
     * @param currentMsg - Current response message
     * @return Whether the value is valid, or an error message
     */
    validate(val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage): boolean | string | Promise<boolean | string>;
    /**
     * Parses the raw value string into a usable value
     * @param val - Value to parse
     * @param originalMsg - Message that triggered the command
     * @param arg - Argument the value was obtained from
     * @param currentMsg - Current response message
     * @return Usable value
     */
    parse(val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage): unknown | Promise<unknown>;
    /**
     * Checks whether a value is considered to be empty. This determines whether the default value for an argument
     * should be used and changes the response to the user under certain circumstances.
     * @param val - Value to check for emptiness
     * @param originalMsg - Message that triggered the command
     * @param arg - Argument the value was obtained from
     * @param currentMsg - Current response message
     * @return Whether the value is empty
     */
    isEmpty(val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage): boolean;
}
