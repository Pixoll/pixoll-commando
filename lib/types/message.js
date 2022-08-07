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
    async validate(val, msg) {
        const matches = val.match(this.msgRegex);
        if (!matches)
            return 'Please enter a valid message id or URL.';
        const message = await msg.channel.messages.fetch(matches[1] ?? matches[2]).catch(() => null);
        return !!message;
    }
    parse(val, msg) {
        return msg.channel.messages.resolve(val);
    }
}
exports.default = MessageArgumentType;
//# sourceMappingURL=message.js.map