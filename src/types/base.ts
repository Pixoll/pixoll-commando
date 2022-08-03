import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';

/** A type for command arguments */
export default abstract class ArgumentType {
    /** Client that this argument type is for */
    declare public readonly client: CommandoClient;
    /** ID of this argument type (this is what you specify in {@link ArgumentInfo#type}) */
    public id: string;

    /**
     * @param client - The client the argument type is for
     * @param id - The argument type ID (this is what you specify in {@link ArgumentInfo#type})
     */
    public constructor(client: CommandoClient, id: string) {
        if (!client) throw new Error('A client must be specified.');
        if (typeof id !== 'string') throw new Error('Argument type ID must be a string.');
        if (id !== id.toLowerCase()) throw new Error('Argument type ID must be lowercase.');

        Object.defineProperty(this, 'client', { value: client });

        this.id = id;
    }

    /**
     * Validates a value string against the type
     * @param val - Value to validate
     * @param originalMsg - Message that triggered the command
     * @param arg - Argument the value was obtained from
     * @param currentMsg - Current response message
     * @return Whether the value is valid, or an error message
     */
    public validate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage
    ): Promise<boolean | string> | boolean | string {
        throw new Error(`${this.constructor.name} doesn't have a validate() method.`);
    }

    /**
     * Parses the raw value string into a usable value
     * @param val - Value to parse
     * @param originalMsg - Message that triggered the command
     * @param arg - Argument the value was obtained from
     * @param currentMsg - Current response message
     * @return Usable value
     */
    public parse(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage
    ): unknown {
        throw new Error(`${this.constructor.name} doesn't have a parse() method.`);
    }

    /**
     * Checks whether a value is considered to be empty. This determines whether the default value for an argument
     * should be used and changes the response to the user under certain circumstances.
     * @param val - Value to check for emptiness
     * @param originalMsg - Message that triggered the command
     * @param arg - Argument the value was obtained from
     * @param currentMsg - Current response message
     * @return Whether the value is empty
     */
    public isEmpty(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        val: string[] | string, originalMsg: CommandoMessage, arg: Argument, currentMsg: CommandoMessage = originalMsg
    ): boolean {
        if(Array.isArray(val)) return val.length === 0;
        return !val;
    }
}
