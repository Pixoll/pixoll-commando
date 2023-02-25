import CommandoClient from '../client';
import ArgumentType from './base';
export default class BooleanArgumentType extends ArgumentType<'boolean'> {
    protected truthy: Set<string>;
    protected falsy: Set<string>;
    constructor(client: CommandoClient);
    validate(value: string): boolean;
    parse(value: string): boolean;
}
