import { Invite } from 'discord.js';
import CommandoClient from '../client';
import ArgumentType from './base';

export default class InviteArgumentType extends ArgumentType {
    /** The fetched invite */
    protected fetchedInvite: Invite | null;

    public constructor(client: CommandoClient) {
        super(client, 'invite');

        this.fetchedInvite = null;
    }

    public async validate(val: string): Promise<boolean> {
        const invite = await this.client.fetchInvite(val).catch(() => null);
        this.fetchedInvite = invite;
        return !!invite;
    }

    public async parse(val: string): Promise<Invite> {
        const { fetchedInvite } = this;
        if (fetchedInvite) {
            this.fetchedInvite = null;
            return fetchedInvite;
        }
        return await this.client.fetchInvite(val);
    }
}
