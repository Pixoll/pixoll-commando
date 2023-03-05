"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const better_ms_1 = require("better-ms");
const util_1 = __importDefault(require("../util"));
class DurationArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'duration');
    }
    validate(value, _, argument) {
        if (typeof value === 'undefined')
            return false;
        const int = typeof value === 'number' ? value
            : /^\d+$/.test(value) ? parseInt(value) : (0, better_ms_1.ms)(value);
        if (!int || int < 1000) {
            return 'Please enter a valid duration format. Use the `help` command for more information.';
        }
        if (int > (0, better_ms_1.ms)('1y')) {
            return 'The max. usable duration is `1 year`. Please try again.';
        }
        if (!util_1.default.isNullish(argument.min) && int < argument.min) {
            return `Please enter a duration greater than or exactly to ${(0, better_ms_1.ms)(argument.min)}.`;
        }
        if (!util_1.default.isNullish(argument.max) && int > argument.max) {
            return `Please enter a duration less than or exactly to ${(0, better_ms_1.ms)(argument.max)}.`;
        }
        return true;
    }
    parse(value) {
        if (typeof value === 'number')
            return value;
        if (/^\d+$/.test(value))
            return parseInt(value);
        return (0, better_ms_1.ms)(value);
    }
}
exports.default = DurationArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvZHVyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBa0M7QUFDbEMseUNBQStCO0FBRy9CLG1EQUEyQjtBQUUzQixNQUFxQixvQkFBcUIsU0FBUSxjQUF3QjtJQUN0RSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBeUIsRUFBRSxDQUFVLEVBQUUsUUFBOEI7UUFDakYsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDL0MsTUFBTSxHQUFHLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQ3pDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBRSxFQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXhELElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtZQUNwQixPQUFPLG9GQUFvRixDQUFDO1NBQy9GO1FBRUQsSUFBSSxHQUFHLEdBQUcsSUFBQSxjQUFFLEVBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEIsT0FBTyx5REFBeUQsQ0FBQztTQUNwRTtRQUVELElBQUksQ0FBQyxjQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNyRCxPQUFPLHNEQUFzRCxJQUFBLGNBQUUsRUFBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztTQUNwRjtRQUNELElBQUksQ0FBQyxjQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNyRCxPQUFPLG1EQUFtRCxJQUFBLGNBQUUsRUFBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztTQUNqRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBYTtRQUN0QixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVE7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUM1QyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsT0FBTyxJQUFBLGNBQUUsRUFBQyxLQUFLLENBQUMsQ0FBQztJQUNyQixDQUFDO0NBQ0o7QUFqQ0QsdUNBaUNDIn0=