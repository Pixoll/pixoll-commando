"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** A type for command arguments */
class ArgumentType {
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
     * Checks whether a value is considered to be empty. This determines whether the default value for an argument
     * should be used and changes the response to the user under certain circumstances.
     * @param value - Value to check for emptiness
     * @param originalMessage - Message that triggered the command
     * @param argument - Argument the value was obtained from
     * @param currentMessage - Current response message
     * @return Whether the value is empty
     */
    isEmpty(value, originalMessage, argument, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentMessage = originalMessage) {
        if (Array.isArray(value))
            return value.length === 0;
        return !value;
    }
}
exports.default = ArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0EsbUNBQW1DO0FBQ25DLE1BQThCLFlBQVk7SUFHdEMsdUZBQXVGO0lBQ2hGLEVBQUUsQ0FBSTtJQUViOzs7T0FHRztJQUNILFlBQW1CLE1BQXNCLEVBQUUsRUFBSztRQUM1QyxJQUFJLENBQUMsTUFBTTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUM1RCxJQUFJLE9BQU8sRUFBRSxLQUFLLFFBQVE7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDbEYsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLFdBQVcsRUFBRTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUVwRixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBMEJEOzs7Ozs7OztPQVFHO0lBQ0ksT0FBTyxDQUNWLEtBQW9DLEVBQ3BDLGVBQWdDLEVBQ2hDLFFBQXFCO0lBQ3JCLDZEQUE2RDtJQUM3RCxpQkFBa0MsZUFBZTtRQUVqRCxJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztRQUNuRCxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQS9ERCwrQkErREMifQ==