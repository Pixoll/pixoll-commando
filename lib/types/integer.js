"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        if (arg.min !== null && typeof arg.min !== 'undefined' && int < arg.min) {
            return `Please enter a number above or exactly ${arg.min}.`;
        }
        if (arg.max !== null && typeof arg.max !== 'undefined' && int > arg.max) {
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