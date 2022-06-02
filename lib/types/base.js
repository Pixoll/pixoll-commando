"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** A type for command arguments */
class ArgumentType {
    /** Client that this argument type is for */
    client;
    /** ID of this argument type (this is what you specify in {@link ArgumentInfo#type}) */
    id;
    /**
     * @param client - The client the argument type is for
     * @param id - The argument type ID (this is what you specify in {@link ArgumentInfo#type})
     */
    constructor(client, id) {
        if (!client)
            throw new Error('A client must be specified.');
        if (typeof id !== 'string')
            throw new Error('Argument type ID must be a string.');
        if (id !== id.toLowerCase())
            throw new Error('Argument type ID must be lowercase.');
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
    validate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    val, originalMsg, arg, currentMsg) {
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
    parse(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    val, originalMsg, arg, currentMsg) {
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
    isEmpty(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    val, originalMsg, arg, currentMsg = originalMsg) {
        if (Array.isArray(val))
            return val.length === 0;
        return !val;
    }
}
exports.default = ArgumentType;
//# sourceMappingURL=base.js.map