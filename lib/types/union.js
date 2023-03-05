"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
/** A type for command arguments that handles multiple other types */
class ArgumentUnionType extends base_1.default {
    /** Types to handle, in order of priority */
    types;
    constructor(client, id) {
        super(client, id);
        this.types = [];
        const typeIds = id.split('|');
        for (const typeId of typeIds) {
            const type = client.registry.types.get(typeId);
            if (!type)
                throw new Error(`Argument type "${typeId}" is not registered.`);
            this.types.push(type);
        }
    }
    async validate(value, message, argument) {
        const results = await Promise.all(this.types.map(type => !type.isEmpty(value, message, argument) && type.validate(value, message, argument)));
        if (results.some(valid => valid === true))
            return true;
        const errors = results.filter((valid) => typeof valid === 'string');
        if (errors.length > 0)
            return errors.join('\n');
        return false;
    }
    async parse(value, message, argument) {
        const results = await Promise.all(this.types.map(type => !type.isEmpty(value, message, argument) && type.validate(value, message, argument)));
        for (let i = 0; i < results.length; i++) {
            if (results[i] && typeof results[i] !== 'string') {
                return this.types[i].parse(value, message, argument);
            }
        }
        throw new Error(`Couldn't parse value "${value}" with union type ${this.id}.`);
    }
    isEmpty(value, message, argument) {
        return !this.types.some(type => !type.isEmpty(value, message, argument));
    }
}
exports.default = ArgumentUnionType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvdW5pb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFHQSxrREFBa0M7QUFFbEMscUVBQXFFO0FBQ3JFLE1BQXFCLGlCQUFxRSxTQUFRLGNBQVk7SUFDMUcsNENBQTRDO0lBQ3JDLEtBQUssQ0FBaUI7SUFFN0IsWUFBbUIsTUFBc0IsRUFBRSxFQUFVO1FBQ2pELEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBd0IsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDMUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxJQUFJO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLE1BQU0sc0JBQXNCLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtJQUNMLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBUSxDQUNqQixLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7UUFFdkUsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQ3BELENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FDckYsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRXZELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQW1CLEVBQUUsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQztRQUNyRixJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQUssQ0FDZCxLQUFhLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtRQUUzRCxNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FDcEQsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUNyRixDQUFDLENBQUM7UUFFSCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQzlDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQTZDLENBQUM7YUFDcEc7U0FDSjtRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLEtBQUsscUJBQXFCLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFTSxPQUFPLENBQUMsS0FBYSxFQUFFLE9BQXdCLEVBQUUsUUFBa0I7UUFDdEUsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0NBQ0o7QUFqREQsb0NBaURDIn0=