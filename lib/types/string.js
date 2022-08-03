"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("../util"));
const base_1 = __importDefault(require("./base"));
class StringArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'string');
    }
    validate(val, _, arg) {
        if (arg.oneOf && !arg.oneOf.includes(val.toLowerCase())) {
            return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (!util_1.default.isNullish(arg.min) && val.length < arg.min) {
            return `Please keep the ${arg.label} above or exactly ${arg.min} characters.`;
        }
        if (!util_1.default.isNullish(arg.max) && val.length > arg.max) {
            return `Please keep the ${arg.label} below or exactly ${arg.max} characters.`;
        }
        return true;
    }
    parse(val) {
        return val;
    }
}
exports.default = StringArgumentType;
//# sourceMappingURL=string.js.map