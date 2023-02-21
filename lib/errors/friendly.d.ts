/** Has a message that can be considered user-friendly */
export default class FriendlyError extends Error {
    /**
     * @param message - The error message
     */
    constructor(message: string);
}
