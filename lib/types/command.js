"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = require("../util");
const discord_js_1 = require("discord.js");
class CommandArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'command');
    }
    validate(val) {
        const commands = this.client.registry.findCommands(val);
        if (commands.length === 1)
            return true;
        if (commands.length === 0)
            return false;
        return commands.length <= 15 ?
            `${(0, util_1.disambiguation)(commands.map(cmd => discord_js_1.Util.escapeMarkdown(cmd.name)), 'commands', null)}\n` :
            'Multiple commands found. Please be more specific.';
    }
    parse(val) {
        return this.client.registry.findCommands(val)[0];
    }
}
exports.default = CommandArgumentType;
//# sourceMappingURL=command.js.map