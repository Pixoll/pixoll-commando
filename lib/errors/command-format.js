"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const friendly_1 = __importDefault(require("./friendly"));
/** Has a descriptive message for a command not having proper format */
class CommandFormatError extends friendly_1.default {
    /**
     * @param msg - The command message the error is for
     */
    constructor(msg) {
        const { guild, command } = msg;
        const val = guild ? undefined : null;
        if (!command)
            throw new TypeError('Command cannot be null or undefined.');
        super(`Invalid command usage. The \`${command.name}\` command's accepted format is: ${msg.usage(command.format ?? undefined, val, val)}. Use ${msg.anyUsage(`help ${command.name}`, val, val)} for more information.`);
        this.name = 'CommandFormatError';
    }
}
exports.default = CommandFormatError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC1mb3JtYXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXJyb3JzL2NvbW1hbmQtZm9ybWF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsMERBQXVDO0FBRXZDLHVFQUF1RTtBQUN2RSxNQUFxQixrQkFBbUIsU0FBUSxrQkFBYTtJQUN6RDs7T0FFRztJQUNILFlBQW1CLEdBQW9CO1FBQ25DLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBQy9CLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDckMsSUFBSSxDQUFDLE9BQU87WUFBRSxNQUFNLElBQUksU0FBUyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDMUUsS0FBSyxDQUNELGdDQUFnQyxPQUFPLENBQUMsSUFBSSxvQ0FBb0MsR0FBRyxDQUFDLEtBQUssQ0FDckYsT0FBTyxDQUFDLE1BQU0sSUFBSSxTQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FDeEMsU0FBUyxHQUFHLENBQUMsUUFBUSxDQUNsQixRQUFRLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUNuQyx3QkFBd0IsQ0FDNUIsQ0FBQztRQUNGLElBQUksQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLENBQUM7SUFDckMsQ0FBQztDQUNKO0FBakJELHFDQWlCQyJ9