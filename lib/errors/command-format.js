"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const friendly_1 = __importDefault(require("./friendly"));
/**
 * Has a descriptive message for a command not having proper format
 * @augments FriendlyError
 */
class CommandFormatError extends friendly_1.default {
    /**
     * @param msg - The command message the error is for
     */
    constructor(msg) {
        const { guild, command } = msg;
        const val = guild ? undefined : null;
        super(`Invalid command usage. The \`${command.name}\` command's accepted format is: ${msg.usage(command.format ?? undefined, val, val)}. Use ${msg.anyUsage(`help ${command.name}`, val, val)} for more information.`);
        this.name = 'CommandFormatError';
    }
}
exports.default = CommandFormatError;
//# sourceMappingURL=command-format.js.map