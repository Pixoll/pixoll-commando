import CommandoClient from '../client';
import { CommandoInvite } from '../discord.overrides';
import ArgumentType from './base';

export default class InviteArgumentType extends ArgumentType<'invite'> {
    /** The fetched invite */
    protected fetchedInvite: CommandoInvite | null;

    public constructor(client: CommandoClient) {
        super(client, 'invite');

        this.fetchedInvite = null;
    }

    public async validate(value: string | undefined): Promise<boolean> {
        if (typeof value === 'undefined') return false;
        const invite = await this.client.fetchInvite(value).catch(() => null);
        this.fetchedInvite = invite as CommandoInvite | null;
        return !!invite;
    }

    public async parse(value: string): Promise<CommandoInvite> {
        const { fetchedInvite } = this;
        if (fetchedInvite) {
            this.fetchedInvite = null;
            return fetchedInvite;
        }
        return await this.client.fetchInvite(value) as CommandoInvite;
    }
}
