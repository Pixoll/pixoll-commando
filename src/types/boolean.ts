import CommandoClient from '../client';
import ArgumentType from './base';

export default class BooleanArgumentType extends ArgumentType<'boolean'> {
    protected truthy: Set<string>;
    protected falsy: Set<string>;

    public constructor(client: CommandoClient) {
        super(client, 'boolean');
        this.truthy = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
        this.falsy = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);
    }

    public validate(value: string): boolean {
        const lc = value.toLowerCase();
        return this.truthy.has(lc) || this.falsy.has(lc);
    }

    public parse(value: string): boolean {
        const lc = value.toLowerCase();
        if (this.truthy.has(lc)) return true;
        if (this.falsy.has(lc)) return false;
        throw new RangeError('Unknown boolean value.');
    }
}
