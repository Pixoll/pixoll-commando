"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const emoji_regex_1 = __importDefault(require("emoji-regex"));
const base_1 = __importDefault(require("./base"));
class DefaultEmojiArgumentType extends base_1.default {
    emojiRegex;
    constructor(client) {
        super(client, 'default-emoji');
        this.emojiRegex = new RegExp(`^(?:${(0, emoji_regex_1.default)().source})$`);
    }
    validate(value, _, arg) {
        if (!this.emojiRegex.test(value))
            return false;
        if (arg.oneOf && !arg.oneOf.includes(value)) {
            return `Please enter one of the following options: ${arg.oneOf.join(' | ')}`;
        }
        return true;
    }
    parse(value) {
        return value;
    }
}
exports.default = DefaultEmojiArgumentType;
//# sourceMappingURL=default-emoji.js.map