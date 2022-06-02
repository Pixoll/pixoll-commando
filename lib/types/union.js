"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
/**
 * A type for command arguments that handles multiple other types
 * @augments ArgumentType
 */
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
    async validate(val, msg, arg) {
        let results = this.types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg));
        results = await Promise.all(results);
        if (results.some(valid => valid && typeof valid !== 'string'))
            return true;
        const errors = results.filter(valid => typeof valid === 'string');
        if (errors.length > 0)
            return errors.join('\n');
        return false;
    }
    async parse(val, msg, arg) {
        let results = this.types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg));
        results = await Promise.all(results);
        for (let i = 0; i < results.length; i++) {
            if (results[i] && typeof results[i] !== 'string')
                return this.types[i].parse(val, msg, arg);
        }
        throw new Error(`Couldn't parse value "${val}" with union type ${this.id}.`);
    }
    isEmpty(val, msg, arg) {
        return !this.types.some(type => !type.isEmpty(val, msg, arg));
    }
}
exports.default = ArgumentUnionType;
//# sourceMappingURL=union.js.map