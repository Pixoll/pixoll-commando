import { Awaitable } from 'discord.js';
import CommandoClient from '../client';
import Argument, { ArgumentTypeString, ArgumentTypeStringMap } from '../commands/argument';
import CommandoMessage from '../extensions/message';

/** A type for command arguments */
export default abstract class ArgumentType<T extends ArgumentTypeString = ArgumentTypeString> {
    /** Client that this argument type is for */
    declare public readonly client: CommandoClient;
    /** ID of this argument type (this is what you specify in {@link ArgumentInfo#type}) */
    public id: T;

    /**
     * @param client - The client the argument type is for
     * @param id - The argument type ID (this is what you specify in {@link ArgumentInfo#type})
     */
    public constructor(client: CommandoClient, id: T) {
        if (!client) throw new Error('A client must be specified.');
        if (typeof id !== 'string') throw new Error('Argument type ID must be a string.');
        if (id !== id.toLowerCase()) throw new Error('Argument type ID must be lowercase.');

        Object.defineProperty(this, 'client', { value: client });

        this.id = id;
    }

    /**
     * Validates a value string against the type
     * @param value - Value to validate
     * @param originalMessage - Message that triggered the command
     * @param argument - Argument the value was obtained from
     * @param currentMessage - Current response message
     * @return Whether the value is valid, or an error message
     */
    public abstract validate(
        value: string | undefined, originalMessage: CommandoMessage, argument: Argument<T>, currentMessage?: CommandoMessage
    ): Awaitable<boolean | string>;

    /**
     * Parses the raw value string into a usable value
     * @param value - Value to parse
     * @param originalMessage - Message that triggered the command
     * @param argument - Argument the value was obtained from
     * @param currentMessage - Current response message
     * @return Usable value
     */
    public abstract parse(
        value: string | undefined, originalMessage: CommandoMessage, argument: Argument<T>, currentMessage?: CommandoMessage
    ): Awaitable<ArgumentTypeStringMap[T] | null>;

    /**
     * Checks whether a value is considered to be empty. This determines whether the default value for an argument
     * should be used and changes the response to the user under certain circumstances.
     * @param value - Value to check for emptiness
     * @param originalMessage - Message that triggered the command
     * @param argument - Argument the value was obtained from
     * @param currentMessage - Current response message
     * @return Whether the value is empty
     */
    public isEmpty(
        value: string[] | string | undefined,
        originalMessage: CommandoMessage,
        argument: Argument<T>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        currentMessage: CommandoMessage = originalMessage
    ): boolean {
        if(Array.isArray(value)) return value.length === 0;
        return !value;
    }
}
