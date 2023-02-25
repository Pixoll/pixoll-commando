"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
class MessageArgumentType extends base_1.default {
    msgRegex;
    constructor(client) {
        super(client, 'message');
        // Match id or message URL
        this.msgRegex = /^(\d+)$|discord\.com\/channels\/\d+\/\d+\/(\d+)$/;
    }
    async validate(value, message) {
        const matches = value.match(this.msgRegex);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9tZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0Esa0RBQWtDO0FBRWxDLE1BQXFCLG1CQUFvQixTQUFRLGNBQXVCO0lBQzFELFFBQVEsQ0FBUztJQUUzQixZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3pCLDBCQUEwQjtRQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLGtEQUFrRCxDQUFDO0lBQ3ZFLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWEsRUFBRSxPQUF3QjtRQUN6RCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8seUNBQXlDLENBQUM7UUFDL0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3RixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDakIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhLEVBQUUsT0FBd0I7UUFDaEQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFnQyxDQUFDO0lBQ2xGLENBQUM7Q0FDSjtBQW5CRCxzQ0FtQkMifQ==