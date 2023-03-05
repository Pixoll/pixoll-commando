import CommandoClient from '../client';
import { CommandoInvite } from '../discord.overrides';
import ArgumentType from './base';
export default class InviteArgumentType extends ArgumentType<'invite'> {
    /** The fetched invite */
    protected fetchedInvite: CommandoInvite | null;
    constructor(client: CommandoClient);
    validate(value: string | undefined): Promise<boolean>;
    parse(value: string): Promise<CommandoInvite>;
}
