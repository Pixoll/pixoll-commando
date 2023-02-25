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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJpZW5kbHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXJyb3JzL2ZyaWVuZGx5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseURBQXlEO0FBQ3pELE1BQXFCLGFBQWMsU0FBUSxLQUFLO0lBQzVDOztPQUVHO0lBQ0gsWUFBbUIsT0FBZTtRQUM5QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0NBQ0o7QUFSRCxnQ0FRQyJ9