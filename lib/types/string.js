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
        if (typeof value === 'undefined')
            return false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL3N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLG1EQUEyQjtBQUMzQixrREFBa0M7QUFFbEMsTUFBcUIsa0JBQW1CLFNBQVEsY0FBc0I7SUFDbEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQXlCLEVBQUUsQ0FBVSxFQUFFLFFBQTRCO1FBQy9FLElBQUksT0FBTyxLQUFLLEtBQUssV0FBVztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQy9DLElBQUksUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFO1lBQ2pFLE9BQU8sOENBQThDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQzdHO1FBQ0QsSUFBSSxDQUFDLGNBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUM5RCxPQUFPLG1CQUFtQixRQUFRLENBQUMsS0FBSyxxQkFBcUIsUUFBUSxDQUFDLEdBQUcsY0FBYyxDQUFDO1NBQzNGO1FBQ0QsSUFBSSxDQUFDLGNBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUM5RCxPQUFPLG1CQUFtQixRQUFRLENBQUMsS0FBSyxxQkFBcUIsUUFBUSxDQUFDLEdBQUcsY0FBYyxDQUFDO1NBQzNGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhO1FBQ3RCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQXZCRCxxQ0F1QkMifQ==