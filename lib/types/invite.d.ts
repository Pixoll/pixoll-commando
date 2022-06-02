import { Invite } from 'discord.js';
import CommandoClient from '../client';
import ArgumentType from './base';
export default class InviteArgumentType extends ArgumentType {
    /** The fetched invite */
    protected fetched: Invite | null;
    constructor(client: CommandoClient);
    validate(val: string): Promise<boolean>;
    parse(val: string): Promise<Invite>;
}
