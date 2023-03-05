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
        if (typeof value === 'undefined' || !this.emojiRegex.test(value))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1lbW9qaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9kZWZhdWx0LWVtb2ppLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsOERBQXFDO0FBR3JDLGtEQUFrQztBQUVsQyxNQUFxQix3QkFBeUIsU0FBUSxjQUE2QjtJQUMvRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxJQUFXLFVBQVU7UUFDakIsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUEscUJBQVUsR0FBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUF5QixFQUFFLENBQVUsRUFBRSxRQUFtQztRQUN0RixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQy9FLElBQUksUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ25ELE9BQU8sOENBQThDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7U0FDckY7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQWE7UUFDdEIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKO0FBcEJELDJDQW9CQyJ9