"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
class BooleanArgumentType extends base_1.default {
    truthy;
    falsy;
    constructor(client) {
        super(client, 'boolean');
        this.truthy = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
        this.falsy = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);
    }
    validate(value) {
        const lc = value.toLowerCase();
        return this.truthy.has(lc) || this.falsy.has(lc);
    }
    parse(value) {
        const lc = value.toLowerCase();
        if (this.truthy.has(lc))
            return true;
        if (this.falsy.has(lc))
            return false;
        throw new RangeError('Unknown boolean value.');
    }
}
exports.default = BooleanArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vbGVhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9ib29sZWFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0Esa0RBQWtDO0FBRWxDLE1BQXFCLG1CQUFvQixTQUFRLGNBQXVCO0lBQzFELE1BQU0sQ0FBYztJQUNwQixLQUFLLENBQWM7SUFFN0IsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFhO1FBQ3pCLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFTSxLQUFLLENBQUMsS0FBYTtRQUN0QixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNyQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUNuRCxDQUFDO0NBQ0o7QUFyQkQsc0NBcUJDIn0=