"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
// Match id or message URL
const messageRegex = /^(\d+)$|discord\.com\/channels\/\d+\/\d+\/(\d+)$/;
class MessageArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'message');
    }
    get messageRegex() {
        return messageRegex;
    }
    async validate(value, message) {
        if (typeof value === 'undefined')
            return false;
        const matches = value.match(this.messageRegex);
        if (!matches)
            return 'Please enter a valid message id or URL.';
        const msg = await message.channel.messages.fetch(matches[1] ?? matches[2]).catch(() => null);
        return !!msg;
    }
    parse(value, message) {
        return message.channel.messages.resolve(value);
    }
}
exports.default = MessageArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9tZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0Esa0RBQWtDO0FBRWxDLDBCQUEwQjtBQUMxQixNQUFNLFlBQVksR0FBRyxrREFBa0QsQ0FBQztBQUV4RSxNQUFxQixtQkFBb0IsU0FBUSxjQUF1QjtJQUNwRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxJQUFXLFlBQVk7UUFDbkIsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBeUIsRUFBRSxPQUF3QjtRQUNyRSxJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMvQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8seUNBQXlDLENBQUM7UUFDL0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3RixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDakIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhLEVBQUUsT0FBd0I7UUFDaEQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFnQyxDQUFDO0lBQ2xGLENBQUM7Q0FDSjtBQXBCRCxzQ0FvQkMifQ==