"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
class MessageArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'message');
    }
    async validate(val, msg) {
        if (!/^\d+$/.test(val))
            return false;
        const message = await msg.channel.messages.fetch(val).catch(() => null);
        return !!message;
    }
    parse(val, msg) {
        return msg.channel.messages.cache.get(val) ?? null;
    }
}
exports.default = MessageArgumentType;
//# sourceMappingURL=message.js.map