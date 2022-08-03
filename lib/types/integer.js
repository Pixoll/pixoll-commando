"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("../util"));
const base_1 = __importDefault(require("./base"));
class IntegerArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'integer');
    }
    validate(val, _, arg) {
        const int = parseInt(val);
        if (isNaN(int))
            return false;
        if (arg.oneOf && !arg.oneOf.includes(int)) {
            return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (!util_1.default.isNullish(arg.min) && int < arg.min) {
            return `Please enter a number above or exactly ${arg.min}.`;
        }
        if (!util_1.default.isNullish(arg.max) && int > arg.max) {
            return `Please enter a number below or exactly ${arg.max}.`;
        }
        return true;
    }
    parse(val) {
        return parseInt(val);
    }
}
exports.default = IntegerArgumentType;
//# sourceMappingURL=integer.js.map