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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9jb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQWtDO0FBQ2xDLG1EQUEyQjtBQUMzQiwyQ0FBNEM7QUFJNUMsTUFBcUIsbUJBQW9CLFNBQVEsY0FBdUI7SUFDcEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQWE7UUFDekIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDdkMsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN4QyxPQUFPLFFBQVEsQ0FBQyxNQUFNLElBQUksRUFBRTtZQUN4QixDQUFDLENBQUMsR0FBRyxjQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFBLDJCQUFjLEVBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUk7WUFDdkYsQ0FBQyxDQUFDLG1EQUFtRCxDQUFDO0lBQzlELENBQUM7SUFFTSxLQUFLLENBQUMsS0FBYTtRQUN0QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBQ0o7QUFqQkQsc0NBaUJDIn0=