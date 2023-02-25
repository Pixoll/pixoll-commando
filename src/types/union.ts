import CommandoClient from '../client';
import Argument, { ArgumentTypeString, ArgumentTypeStringMap } from '../commands/argument';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';

/** A type for command arguments that handles multiple other types */
export default class ArgumentUnionType<T extends ArgumentTypeString = ArgumentTypeString> extends ArgumentType {
    /** Types to handle, in order of priority */
    public types: ArgumentType[];

    public constructor(client: CommandoClient, id: string) {
        super(client, id as ArgumentTypeString);

        this.types = [];
        const typeIds = id.split('|');
        for (const typeId of typeIds) {
            const type = client.registry.types.get(typeId);
            if (!type) throw new Error(`Argument type "${typeId}" is not registered.`);
            this.types.push(type);
        }
    }

    public async validate(value: string, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const results = await Promise.all(this.types.map(type =>
            !type.isEmpty(value, message, argument) && type.validate(value, message, argument)
        ));
        if (results.some(valid => valid && typeof valid !== 'string')) return true;

        const errors = results.filter(valid => typeof valid === 'string');
        if (errors.length > 0) return errors.join('\n');

        return false;
    }

    public async parse(
        value: string, message: CommandoMessage, argument: Argument
    ): Promise<ArgumentTypeStringMap[T] | null> {
        const results = await Promise.all(this.types.map(type =>
            !type.isEmpty(value, message, argument) && type.validate(value, message, argument)
        ));

        for (let i = 0; i < results.length; i++) {
            if (results[i] && typeof results[i] !== 'string') {
                return this.types[i].parse(value, message, argument) as ArgumentTypeStringMap[T] | null;
            }
        }

        throw new Error(`Couldn't parse value "${value}" with union type ${this.id}.`);
    }

    public isEmpty(value: string, message: CommandoMessage, argument: Argument): boolean {
        return !this.types.some(type => !type.isEmpty(value, message, argument));
    }
}
