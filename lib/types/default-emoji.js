"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const emoji_regex_1 = __importDefault(require("emoji-regex"));
const base_1 = __importDefault(require("./base"));
class DefaultEmojiArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'default-emoji');
    }
    get emojiRegex() {
        return new RegExp(`^(?:${(0, emoji_regex_1.default)().source})$`);
    }
    validate(value, _, argument) {
        if (!this.emojiRegex.test(value))
            return false;
        if (argument.oneOf && !argument.oneOf.includes(value)) {
            return `Please enter one of the following options: ${argument.oneOf.join(' | ')}`;
        }
        return true;
    }
    parse(value) {
        return value;
    }
}
exports.default = DefaultEmojiArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1lbW9qaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9kZWZhdWx0LWVtb2ppLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsOERBQXFDO0FBR3JDLGtEQUFrQztBQUVsQyxNQUFxQix3QkFBeUIsU0FBUSxjQUE2QjtJQUMvRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxJQUFXLFVBQVU7UUFDakIsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUEscUJBQVUsR0FBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFhLEVBQUUsQ0FBVSxFQUFFLFFBQW1DO1FBQzFFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMvQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNuRCxPQUFPLDhDQUE4QyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1NBQ3JGO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhO1FBQ3RCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQXBCRCwyQ0FvQkMifQ==