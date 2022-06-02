import CommandoClient from '../client';
import ArgumentType from './base';
export default class BooleanArgumentType extends ArgumentType {
    protected truthy: Set<string>;
    protected falsy: Set<string>;
    constructor(client: CommandoClient);
    validate(val: string): boolean;
    parse(val: string): boolean;
}
