import { Database as SyncSQLiteDatabase, Statement as SyncSQLiteStatement } from 'better-sqlite3';
import { If } from 'discord.js';
import SettingProvider from './base';
import { ListenersMap, DefaultSQLiteSettings } from './sqlite';
import CommandoClient from '../client';
import { CommandoGuildResolvable } from '../discord.overrides';
import Command from '../commands/base';
import CommandGroup from '../commands/group';
import { Nullable } from '../util';
/** Uses an SQLite database to store settings with guilds */
export default class SyncSQLiteProvider<Ready extends boolean = boolean, Settings extends DefaultSQLiteSettings = DefaultSQLiteSettings> extends SettingProvider<Settings> {
    /**
     * Client that the provider is for (set once the client is ready,
     * after using {@link CommandoClient.setProvider CommandoClient#setProvider})
     */
    client: If<Ready, CommandoClient<true>>;
    /** Database that will be used for storing/retrieving settings */
    connection: SyncSQLiteDatabase;
    /** Listeners on the Client, mapped by the event name */
    protected listeners: ListenersMap;
    /** Prepared statement to insert or replace a settings row */
    protected insertOrReplaceStatement: SyncSQLiteStatement | null;
    /** Prepared statement to delete an entire settings row */
    protected deleteStatement: SyncSQLiteStatement | null;
    /**
     * @param connection - Database Connection for the provider
     */
    constructor(connection: SyncSQLiteDatabase);
    isReady(): this is SyncSQLiteProvider<true, Settings>;
    init(client: CommandoClient<true>): void;
    destroy(): void;
    get<K extends keyof Settings>(guild: Nullable<CommandoGuildResolvable>, key: K, defaultValue?: Settings[K]): Settings[K] | undefined;
    set<K extends keyof Settings>(guild: Nullable<CommandoGuildResolvable>, key: K, value: Settings[K]): Settings[K];
    remove<K extends keyof Settings>(guild: Nullable<CommandoGuildResolvable>, key: K): Settings[K] | undefined;
    clear(guild: Nullable<CommandoGuildResolvable>): void;
    /**
     * Loads all settings for a guild
     * @param guild - Guild ID to load the settings of (or 'global')
     * @param settings - Settings to load
     */
    protected setupGuild(guild: string, settings: Settings): void;
    /**
     * Sets up a command's status in a guild from the guild's settings
     * @param guild - Guild to set the status in
     * @param command - Command to set the status of
     * @param settings - Settings of the guild
     */
    protected setupGuildCommand(guild: Nullable<CommandoGuildResolvable>, command: Command, settings: Settings): void;
    /**
     * Sets up a command group's status in a guild from the guild's settings
     * @param guild - Guild to set the status in
     * @param group - Group to set the status of
     * @param settings - Settings of the guild
     */
    protected setupGuildGroup(guild: Nullable<CommandoGuildResolvable>, group: CommandGroup, settings: Settings): void;
    /**
     * Updates a global setting on all other shards if using the {@link ShardingManager}.
     * @param key - Key of the setting to update
     * @param value - Value of the setting
     */
    protected updateOtherShards<K extends keyof Settings>(key: K, value: Settings[K] | undefined): void;
}
