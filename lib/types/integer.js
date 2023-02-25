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
    validate(value, _, argument) {
        const int = parseInt(value);
        if (isNaN(int))
            return false;
        if (argument.oneOf && !argument.oneOf.includes(int)) {
            return `Please enter one of the following options: ${argument.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (!util_1.default.isNullish(argument.min) && int < argument.min) {
            return `Please enter a number above or exactly ${argument.min}.`;
        }
        if (!util_1.default.isNullish(argument.max) && int > argument.max) {
            return `Please enter a number below or exactly ${argument.max}.`;
        }
        return true;
    }
    parse(value) {
        return parseInt(value);
    }
}
exports.default = IntegerArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9pbnRlZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsbURBQTJCO0FBQzNCLGtEQUFrQztBQUVsQyxNQUFxQixtQkFBb0IsU0FBUSxjQUF1QjtJQUNwRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBYSxFQUFFLENBQVUsRUFBRSxRQUE2QjtRQUNwRSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFN0IsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDakQsT0FBTyw4Q0FBOEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDN0c7UUFDRCxJQUFJLENBQUMsY0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDckQsT0FBTywwQ0FBMEMsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQ3BFO1FBQ0QsSUFBSSxDQUFDLGNBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ3JELE9BQU8sMENBQTBDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUNwRTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBYTtRQUN0QixPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUF6QkQsc0NBeUJDIn0=