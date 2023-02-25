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
    validate(value, _, argument) {
        if (argument.oneOf && !argument.oneOf.includes(value.toLowerCase())) {
            return `Please enter one of the following options: ${argument.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (!util_1.default.isNullish(argument.min) && value.length < argument.min) {
            return `Please keep the ${argument.label} above or exactly ${argument.min} characters.`;
        }
        if (!util_1.default.isNullish(argument.max) && value.length > argument.max) {
            return `Please keep the ${argument.label} below or exactly ${argument.max} characters.`;
        }
        return true;
    }
    parse(value) {
        return value;
    }
}
exports.default = StringArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL3N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLG1EQUEyQjtBQUMzQixrREFBa0M7QUFFbEMsTUFBcUIsa0JBQW1CLFNBQVEsY0FBc0I7SUFDbEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQWEsRUFBRSxDQUFVLEVBQUUsUUFBNEI7UUFDbkUsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7WUFDakUsT0FBTyw4Q0FBOEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDN0c7UUFDRCxJQUFJLENBQUMsY0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQzlELE9BQU8sbUJBQW1CLFFBQVEsQ0FBQyxLQUFLLHFCQUFxQixRQUFRLENBQUMsR0FBRyxjQUFjLENBQUM7U0FDM0Y7UUFDRCxJQUFJLENBQUMsY0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQzlELE9BQU8sbUJBQW1CLFFBQVEsQ0FBQyxLQUFLLHFCQUFxQixRQUFRLENBQUMsR0FBRyxjQUFjLENBQUM7U0FDM0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQWE7UUFDdEIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKO0FBdEJELHFDQXNCQyJ9