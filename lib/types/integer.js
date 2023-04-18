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
        if (typeof value === 'undefined')
            return false;
        const int = /^\d+$/.test(value) && parseInt(value);
        if (int === false || isNaN(int))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9pbnRlZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsbURBQTJCO0FBQzNCLGtEQUFrQztBQUVsQyxNQUFxQixtQkFBb0IsU0FBUSxjQUF1QjtJQUNwRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBeUIsRUFBRSxDQUFVLEVBQUUsUUFBNkI7UUFDaEYsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDL0MsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsSUFBSSxHQUFHLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUU5QyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNqRCxPQUFPLDhDQUE4QyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUM3RztRQUNELElBQUksQ0FBQyxjQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNyRCxPQUFPLDBDQUEwQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUM7U0FDcEU7UUFDRCxJQUFJLENBQUMsY0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDckQsT0FBTywwQ0FBMEMsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQ3BFO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhO1FBQ3RCLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7Q0FDSjtBQTFCRCxzQ0EwQkMifQ==