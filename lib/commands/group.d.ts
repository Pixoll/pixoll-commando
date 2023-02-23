import { Collection } from 'discord.js';
import CommandoClient from '../client';
import { CommandoGuildResolvable } from '../discord.overrides';
import Command from './base';
/** A group for commands. Whodathunkit? */
export default class CommandGroup {
    /** Client that this group is for */
    readonly client: CommandoClient;
    /** ID of this group */
    id: string;
    /** Name of this group */
    name: string;
    /** The commands in this group (added upon their registration) */
    commands: Collection<string, Command>;
    /** Whether or not this group is protected from being disabled */
    guarded: boolean;
    /** Whether the group is enabled globally */
    protected _globalEnabled: boolean;
    /**
     * @param client - The client the group is for
     * @param id - The ID for the group
     * @param name - The name of the group
     * @param guarded - Whether the group should be protected from disabling
     */
    constructor(client: CommandoClient, id: string, name?: string, guarded?: boolean);
    /**
     * Enables or disables the group in a guild
     * @param guild - Guild to enable/disable the group in
     * @param enabled - Whether the group should be enabled or disabled
     */
    setEnabledIn(guild: CommandoGuildResolvable | null, enabled: boolean): void;
    /**
     * Checks if the group is enabled in a guild
     * @param guild - Guild to check in
     * @return Whether or not the group is enabled
     */
    isEnabledIn(guild: CommandoGuildResolvable | null): boolean;
    /** Reloads all of the group's commands */
    reload(): void;
}
