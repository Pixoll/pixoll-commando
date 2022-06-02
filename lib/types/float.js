"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
class FloatArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'float');
    }
    validate(val, _, arg) {
        const float = parseFloat(val);
        if (isNaN(float))
            return false;
        if (arg.oneOf && !arg.oneOf.includes(float)) {
            return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (arg.min !== null && typeof arg.min !== 'undefined' && float < arg.min) {
            return `Please enter a number above or exactly ${arg.min}.`;
        }
        if (arg.max !== null && typeof arg.max !== 'undefined' && float > arg.max) {
            return `Please enter a number below or exactly ${arg.max}.`;
        }
        return true;
    }
    parse(val) {
        return parseFloat(val);
    }
}
exports.default = FloatArgumentType;
//# sourceMappingURL=float.js.map