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
    validate(value, _, arg) {
        const int = typeof value === 'number' ? value
            : /^\d+$/.test(value) ? parseInt(value) : (0, better_ms_1.ms)(value);
        if (!int || int < 1000) {
            return 'Please enter a valid duration format. Use the `help` command for more information.';
        }
        if (int > (0, better_ms_1.ms)('1y')) {
            return 'The max. usable duration is `1 year`. Please try again.';
        }
        if (!util_1.default.isNullish(arg.min) && int < arg.min) {
            return `Please enter a duration greater than or exactly to ${(0, better_ms_1.ms)(arg.min)}.`;
        }
        if (!util_1.default.isNullish(arg.max) && int > arg.max) {
            return `Please enter a duration less than or exactly to ${(0, better_ms_1.ms)(arg.max)}.`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvZHVyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBa0M7QUFDbEMseUNBQStCO0FBRy9CLG1EQUEyQjtBQUUzQixNQUFxQixvQkFBcUIsU0FBUSxjQUF3QjtJQUN0RSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBYSxFQUFFLENBQVUsRUFBRSxHQUF5QjtRQUNoRSxNQUFNLEdBQUcsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDekMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFFLEVBQUMsS0FBSyxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsSUFBSSxFQUFFO1lBQ3BCLE9BQU8sb0ZBQW9GLENBQUM7U0FDL0Y7UUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFBLGNBQUUsRUFBQyxJQUFJLENBQUMsRUFBRTtZQUNoQixPQUFPLHlEQUF5RCxDQUFDO1NBQ3BFO1FBRUQsSUFBSSxDQUFDLGNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQzNDLE9BQU8sc0RBQXNELElBQUEsY0FBRSxFQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1NBQy9FO1FBQ0QsSUFBSSxDQUFDLGNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQzNDLE9BQU8sbURBQW1ELElBQUEsY0FBRSxFQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1NBQzVFO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhO1FBQ3RCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQzVDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxPQUFPLElBQUEsY0FBRSxFQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQWhDRCx1Q0FnQ0MifQ==