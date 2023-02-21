import CommandoClient from '../client';
import Argument from '../commands/argument';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';

/** A type for command arguments that handles multiple other types */
export default class ArgumentUnionType extends ArgumentType {
    /** Types to handle, in order of priority */
    public types: ArgumentType[];

    public constructor(client: CommandoClient, id: string) {
        super(client, id);

        this.types = [];
        const typeIds = id.split('|');
        for (const typeId of typeIds) {
            const type = client.registry.types.get(typeId);
            if (!type) throw new Error(`Argument type "${typeId}" is not registered.`);
            this.types.push(type);
        }
    }

    public async validate(val: string, msg: CommandoMessage, arg: Argument): Promise<boolean | string> {
        let results = this.types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg));
        results = await Promise.all(results);
        if (results.some(valid => valid && typeof valid !== 'string')) return true;

        const errors = results.filter(valid => typeof valid === 'string');
        if (errors.length > 0) return errors.join('\n');

        return false;
    }

    public async parse(val: string, msg: CommandoMessage, arg: Argument): Promise<unknown> {
        let results = this.types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg));
        results = await Promise.all(results);

        for (let i = 0; i < results.length; i++) {
            if (results[i] && typeof results[i] !== 'string') return this.types[i].parse(val, msg, arg);
        }

        throw new Error(`Couldn't parse value "${val}" with union type ${this.id}.`);
    }

    public isEmpty(val: string, msg: CommandoMessage, arg: Argument): boolean {
        return !this.types.some(type => !type.isEmpty(val, msg, arg));
    }
}
