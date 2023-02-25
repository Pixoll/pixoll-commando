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
        if (results.some(valid => valid && typeof valid !== 'string'))
            return true;
        const errors = results.filter(valid => typeof valid === 'string');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvdW5pb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFHQSxrREFBa0M7QUFFbEMscUVBQXFFO0FBQ3JFLE1BQXFCLGlCQUFxRSxTQUFRLGNBQVk7SUFDMUcsNENBQTRDO0lBQ3JDLEtBQUssQ0FBaUI7SUFFN0IsWUFBbUIsTUFBc0IsRUFBRSxFQUFVO1FBQ2pELEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBd0IsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDMUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxJQUFJO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLE1BQU0sc0JBQXNCLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtJQUNMLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWEsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1FBQzdFLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUNwRCxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQ3JGLENBQUMsQ0FBQztRQUNILElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUUzRSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUM7UUFDbEUsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7WUFBRSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFaEQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFLLENBQ2QsS0FBYSxFQUFFLE9BQXdCLEVBQUUsUUFBa0I7UUFFM0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQ3BELENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FDckYsQ0FBQyxDQUFDO1FBRUgsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDckMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO2dCQUM5QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFvQyxDQUFDO2FBQzNGO1NBQ0o7UUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixLQUFLLHFCQUFxQixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRU0sT0FBTyxDQUFDLEtBQWEsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1FBQ3RFLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQztDQUNKO0FBL0NELG9DQStDQyJ9