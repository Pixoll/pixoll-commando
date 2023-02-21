"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Has a message that can be considered user-friendly */
class FriendlyError extends Error {
    /**
     * @param message - The error message
     */
    constructor(message) {
        super(message);
        this.name = 'FriendlyError';
    }
}
exports.default = FriendlyError;
//# sourceMappingURL=friendly.js.map