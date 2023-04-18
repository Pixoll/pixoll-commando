"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("../util"));
const base_1 = __importDefault(require("./base"));
class FloatArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'float');
    }
    validate(value, _, argument) {
        if (typeof value === 'undefined')
            return false;
        const float = /^[\d.]+$/.test(value) && parseFloat(value);
        if (float === false || isNaN(float))
            return false;
        if (argument.oneOf && !argument.oneOf.includes(float)) {
            return `Please enter one of the following options: ${argument.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (!util_1.default.isNullish(argument.min) && float < argument.min) {
            return `Please enter a number above or exactly ${argument.min}.`;
        }
        if (!util_1.default.isNullish(argument.max) && float > argument.max) {
            return `Please enter a number below or exactly ${argument.max}.`;
        }
        return true;
    }
    parse(value) {
        return parseFloat(value);
    }
}
exports.default = FloatArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvYXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvZmxvYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSxtREFBMkI7QUFDM0Isa0RBQWtDO0FBRWxDLE1BQXFCLGlCQUFrQixTQUFRLGNBQXFCO0lBQ2hFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUF5QixFQUFFLENBQVUsRUFBRSxRQUEyQjtRQUM5RSxJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMvQyxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxRCxJQUFJLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRWxELElBQUksUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ25ELE9BQU8sOENBQThDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQzdHO1FBQ0QsSUFBSSxDQUFDLGNBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ3ZELE9BQU8sMENBQTBDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUNwRTtRQUNELElBQUksQ0FBQyxjQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUN2RCxPQUFPLDBDQUEwQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUM7U0FDcEU7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQWE7UUFDdEIsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0IsQ0FBQztDQUNKO0FBMUJELG9DQTBCQyJ9