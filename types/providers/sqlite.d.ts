import { Database as SQLiteDatabase, Statement as SQLiteStatement } from 'sqlite';
import { If } from 'discord.js';
import SettingProvider from './base';
import CommandoClient, { CommandoClientEvents } from '../client';
import { CommandoGuildResolvable } from '../discord.overrides';
import Command from '../commands/base';
import CommandGroup from '../commands/group';
import { Nullable, PropertiesOf } from '../util';
type EventName = keyof CommandoClientEvents;
type EventListener = (...args: PropertiesOf<CommandoClientEvents>) => unknown;
export interface ListenersMap extends Map<EventName, EventListener> {
    set<K extends EventName>(key: K, value: (...args: CommandoClientEvents[K]) => unknown): ListenersMap;
}
export interface DefaultSQLiteSettings {
    prefix?: string | null | undefined;
    [k: `cmd-${string}`]: boolean | undefined;
    [k: `grp-${string}`]: boolean | undefined;
    [k: string]: unknown;
}
export interface SQLiteRow {
    guild: string;
    settings: string;
}
/** Uses an SQLite database to store settings with guilds */
export default class SQLiteProvider<Ready extends boolean = boolean, Settings extends DefaultSQLiteSettings = DefaultSQLiteSettings> extends SettingProvider<Settings> {
    /**
     * Client that the provider is for (set once the client is ready,
     * after using {@link CommandoClient.setProvider CommandoClient#setProvider})
     */
    client: If<Ready, CommandoClient<true>>;
    /** Database that will be used for storing/retrieving settings */
    db: SQLiteDatabase;
    /** Listeners on the Client, mapped by the event name */
    protected listeners: ListenersMap;
    /** Prepared statement to insert or replace a settings row */
    protected insertOrReplaceStatement: SQLiteStatement | null;
    /** Prepared statement to delete an entire settings row */
    protected deleteStatement: SQLiteStatement | null;
    /**
     * @param db - Database for the provider
     */
    constructor(db: SQLiteDatabase);
    isReady(): this is SQLiteProvider<true, Settings>;
    init(client: CommandoClient<true>): Promise<void>;
    destroy(): Promise<void>;
    get<K extends keyof Settings>(guild: Nullable<CommandoGuildResolvable>, key: K, defaultValue?: Settings[K]): Settings[K] | undefined;
    set<K extends keyof Settings>(guild: Nullable<CommandoGuildResolvable>, key: K, value: Settings[K]): Promise<Settings[K]>;
    remove<K extends keyof Settings>(guild: Nullable<CommandoGuildResolvable>, key: K): Promise<Settings[K] | undefined>;
    clear(guild: Nullable<CommandoGuildResolvable>): Promise<void>;
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
export {};
