import { Collection, GuildResolvable } from 'discord.js';
import CommandoClient from '../client';
import CommandoGuild from '../extensions/guild';
import Command from './base';

/** A group for commands. Whodathunkit? */
export default class CommandGroup {
    /** Client that this group is for */
    declare public readonly client: CommandoClient;
    /** ID of this group */
    public id: string;
    /** Name of this group */
    public name: string;
    /** The commands in this group (added upon their registration) */
    public commands: Collection<string, Command>;
    /** Whether or not this group is protected from being disabled */
    public guarded: boolean;
    /** Whether the group is enabled globally */
    protected _globalEnabled: boolean;

    /**
     * @param client - The client the group is for
     * @param id - The ID for the group
     * @param name - The name of the group
     * @param guarded - Whether the group should be protected from disabling
     */
    public constructor(client: CommandoClient, id: string, name = id, guarded = false) {
        if (!client) throw new Error('A client must be specified.');
        if (typeof id !== 'string') throw new TypeError('Group ID must be a string.');
        if (id !== id.toLowerCase()) throw new Error('Group ID must be lowercase.');

        Object.defineProperty(this, 'client', { value: client });

        this.id = id;
        this.name = name ?? id;
        this.commands = new Collection();
        this.guarded = !!guarded;
        this._globalEnabled = true;
    }

    /**
     * Enables or disables the group in a guild
     * @param guild - Guild to enable/disable the group in
     * @param enabled - Whether the group should be enabled or disabled
     */
    public setEnabledIn(guild: CommandoGuild | GuildResolvable | null, enabled: boolean): void {
        const { client, guarded } = this;
        if (typeof guild === 'undefined') throw new TypeError('Guild must not be undefined.');
        if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
        if (guarded) throw new Error('The group is guarded.');
        if (!guild) {
            this._globalEnabled = enabled;
            client.emit('groupStatusChange', null, this, enabled);
            return;
        }
        const commandoGuild = client.guilds.resolve(guild);
        if (!commandoGuild) throw new Error(`Couldn't resolve guild ${guild}`);
        commandoGuild.setGroupEnabled(this, enabled);
    }

    /**
     * Checks if the group is enabled in a guild
     * @param guild - Guild to check in
     * @return Whether or not the group is enabled
     */
    public isEnabledIn(guild: CommandoGuild | GuildResolvable | null): boolean {
        const { client, _globalEnabled, guarded } = this;
        if (guarded) return true;
        if (!guild) return _globalEnabled;
        const commandoGuild = client.guilds.resolve(guild);
        if (!commandoGuild) throw new Error(`Couldn't resolve guild ${guild}`);
        return commandoGuild.isGroupEnabled(this);
    }

    /** Reloads all of the group's commands */
    public reload(): void {
        for (const command of this.commands.values()) command.reload();
    }
}
