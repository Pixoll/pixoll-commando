"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class CommandArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'command');
    }
    validate(value) {
        if (typeof value === 'undefined')
            return false;
        const commands = this.client.registry.findCommands(value);
        if (commands.length === 1)
            return true;
        if (commands.length === 0)
            return false;
        return commands.length <= 15
            ? `${util_1.default.disambiguation(commands.map(cmd => (0, discord_js_1.escapeMarkdown)(cmd.name)), 'commands')}\n`
            : 'Multiple commands found. Please be more specific.';
    }
    parse(value) {
        return this.client.registry.findCommands(value)[0];
    }
}
exports.default = CommandArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9jb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBNEM7QUFJNUMsTUFBcUIsbUJBQW9CLFNBQVEsY0FBdUI7SUFDcEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQXlCO1FBQ3JDLElBQUksT0FBTyxLQUFLLEtBQUssV0FBVztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQy9DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3ZDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDeEMsT0FBTyxRQUFRLENBQUMsTUFBTSxJQUFJLEVBQUU7WUFDeEIsQ0FBQyxDQUFDLEdBQUcsY0FBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQkFBYyxFQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJO1lBQ3ZGLENBQUMsQ0FBQyxtREFBbUQsQ0FBQztJQUM5RCxDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQWE7UUFDdEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkQsQ0FBQztDQUNKO0FBbEJELHNDQWtCQyJ9