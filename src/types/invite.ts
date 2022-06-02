import { Invite } from 'discord.js';
import CommandoClient from '../client';
import ArgumentType from './base';

export default class InviteArgumentType extends ArgumentType {
    /** The fetched invite */
    protected fetched: Invite | null;

    public constructor(client: CommandoClient) {
        super(client, 'invite');

        this.fetched = null;
    }

    public async validate(val: string): Promise<boolean> {
        const invite = await this.client.fetchInvite(val).catch(() => null);
        this.fetched = invite;
        return !!invite;
    }

    public async parse(val: string): Promise<Invite> {
        if (this.fetched) {
            const { fetched } = this;
            this.fetched = null;
            return fetched;
        }
        return await this.client.fetchInvite(val);
    }
}
