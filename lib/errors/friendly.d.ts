/**
 * Has a message that can be considered user-friendly
 * @augments Error
 */
export default class FriendlyError extends Error {
    /**
     * @param message - The error message
     */
    constructor(message: string);
}
