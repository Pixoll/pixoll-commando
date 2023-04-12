import { Database as SyncSQLiteDatabase, Statement as SyncSQLiteStatement } from 'better-sqlite3';
import { If } from 'discord.js';
import SettingProvider from './base';
import { ListenersMap, DefaultSQLiteSettings, SQLiteRow } from './sqlite';
import CommandoClient from '../client';
import { CommandoGuildResolvable } from '../discord.overrides';
import Command from '../commands/base';
import CommandGroup from '../commands/group';
import { Nullable } from '../util';

/** Uses an SQLite database to store settings with guilds */
export default class SyncSQLiteProvider<
    Ready extends boolean = boolean,
    Settings extends DefaultSQLiteSettings = DefaultSQLiteSettings
> extends SettingProvider<Settings> {
    /**
     * Client that the provider is for (set once the client is ready,
     * after using {@link CommandoClient.setProvider CommandoClient#setProvider})
     */
    declare public client: If<Ready, CommandoClient<true>>;
    /** Database that will be used for storing/retrieving settings */
    public connection: SyncSQLiteDatabase;
    /** Listeners on the Client, mapped by the event name */
    protected listeners: ListenersMap;
    /** Prepared statement to insert or replace a settings row */
    protected insertOrReplaceStatement: SyncSQLiteStatement | null;
    /** Prepared statement to delete an entire settings row */
    protected deleteStatement: SyncSQLiteStatement | null;

    /**
     * @param connection - Database Connection for the provider
     */
    public constructor(connection: SyncSQLiteDatabase) {
        super();

        Object.defineProperty(this, 'client', { value: null, writable: true });
        this.connection = connection;
        this.listeners = new Map();
        this.insertOrReplaceStatement = null;
        this.deleteStatement = null;
    }

    public isReady(): this is SyncSQLiteProvider<true, Settings> {
        return !!this.client;
    }

    public init(client: CommandoClient<true>): void {
        this.client = client as If<Ready, CommandoClient<true>>;
        // Just for type narrowing
        if (!this.isReady()) return;
        this.connection.prepare('CREATE TABLE IF NOT EXISTS settings (guild INTEGER PRIMARY KEY, settings TEXT)').run();

        // Load all settings
        const rows = this.connection.prepare('SELECT CAST(guild as TEXT) as guild, settings FROM settings')
            .all() as SQLiteRow[];
        for (const row of rows) {
            let settings;
            try {
                settings = JSON.parse(row.settings);
            } catch (err) {
                client.emit('warn', `SyncSQLiteProvider couldn't parse the settings stored for guild ${row.guild}.`);
                continue;
            }

            const guild = row.guild !== '0' ? row.guild : 'global';
            this.settings.set(guild, settings);
            if (guild !== 'global' && !client.guilds.cache.has(row.guild)) continue;
            this.setupGuild(guild, settings);
        }

        // Prepare statements
        this.insertOrReplaceStatement = this.connection.prepare('INSERT OR REPLACE INTO settings VALUES(?, ?)');
        this.deleteStatement = this.connection.prepare('DELETE FROM settings WHERE guild = ?');

        // Listen for changes
        this.listeners
            .set('commandPrefixChange', (guild, prefix) => {
                this.set(guild, 'prefix', prefix);
            })
            .set('commandStatusChange', (guild, command, enabled) => {
                this.set(guild, `cmd-${command.name}`, enabled as Settings[`cmd-${string}`]);
            })
            .set('groupStatusChange', (guild, group, enabled) => {
                this.set(guild, `grp-${group.id}`, enabled as Settings[`grp-${string}`]);
            })
            .set('guildCreate', guild => {
                const settings = this.settings.get(guild.id);
                if (!settings) return;
                this.setupGuild(guild.id, settings);
            })
            .set('commandRegister', command => {
                for (const [guild, settings] of this.settings) {
                    if (guild !== 'global' && !client.guilds.cache.has(guild)) continue;
                    this.setupGuildCommand(client.guilds.resolve(guild), command, settings);
                }
            })
            .set('groupRegister', group => {
                for (const [guild, settings] of this.settings) {
                    if (guild !== 'global' && !client.guilds.cache.has(guild)) continue;
                    this.setupGuildGroup(client.guilds.resolve(guild), group, settings);
                }
            });
        for (const [event, listener] of this.listeners) client.on(event, listener);
    }

    public destroy(): void {
        // Remove all listeners from the client
        for (const [event, listener] of this.listeners) {
            this.client?.removeListener(event, listener as () => void);
        }
        this.listeners.clear();
    }

    public get<K extends keyof Settings>(
        guild: Nullable<CommandoGuildResolvable>, key: K, defaultValue?: Settings[K]
    ): Settings[K] | undefined {
        const settings = this.settings.get(SettingProvider.getGuildID(guild ?? null));
        return settings
            ? (typeof settings[key] !== 'undefined'
                ? settings[key]
                : defaultValue)
            : defaultValue;
    }

    public set<K extends keyof Settings>(guild: Nullable<CommandoGuildResolvable>, key: K, value: Settings[K]): Settings[K] {
        guild = SettingProvider.getGuildID(guild ?? null);
        let settings = this.settings.get(guild);
        if (!settings) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            settings = {} as Settings;
            this.settings.set(guild, settings);
        }

        // @ts-expect-error: only write inside the package
        settings[key] = value;
        this.insertOrReplaceStatement?.run(guild !== 'global' ? guild : 0, JSON.stringify(settings));
        if (guild === 'global') this.updateOtherShards(key, value);
        return value;
    }

    public remove<K extends keyof Settings>(guild: Nullable<CommandoGuildResolvable>, key: K): Settings[K] | undefined {
        guild = SettingProvider.getGuildID(guild ?? null);
        const settings = this.settings.get(guild);
        if (!settings || typeof settings[key] === 'undefined') return;

        const value = settings[key];
        // @ts-expect-error: only write inside the package
        settings[key] = undefined;
        this.insertOrReplaceStatement?.run(guild !== 'global' ? guild : 0, JSON.stringify(settings));
        if (guild === 'global') this.updateOtherShards(key, undefined);
        return value;
    }

    public clear(guild: Nullable<CommandoGuildResolvable>): void {
        guild = SettingProvider.getGuildID(guild ?? null);
        if (!this.settings.has(guild)) return;
        this.settings.delete(guild);
        this.deleteStatement?.run(guild !== 'global' ? guild : 0);
    }

    /**
     * Loads all settings for a guild
     * @param guild - Guild ID to load the settings of (or 'global')
     * @param settings - Settings to load
     */
    protected setupGuild(guild: string, settings: Settings): void {
        if (!this.isReady()) {
            throw new Error(`${this.constructor.name} must be ready first.`);
        }
        if (typeof guild !== 'string') {
            throw new TypeError('The guild must be a guild ID or "global".');
        }
        const resolvedGuild = this.client.guilds.resolve(guild);

        // Load the command prefix
        if (typeof settings.prefix !== 'undefined') {
            // @ts-expect-error: meant to not trigger an event
            if (resolvedGuild) resolvedGuild._prefix = settings.prefix;
            // @ts-expect-error: meant to not trigger an event
            else this.client._prefix = settings.prefix;
        }

        // Load all command/group statuses
        for (const command of this.client.registry.commands.values()) {
            this.setupGuildCommand(resolvedGuild, command, settings);
        }
        for (const group of this.client.registry.groups.values()) {
            this.setupGuildGroup(resolvedGuild, group, settings);
        }
    }

    /**
     * Sets up a command's status in a guild from the guild's settings
     * @param guild - Guild to set the status in
     * @param command - Command to set the status of
     * @param settings - Settings of the guild
     */
    protected setupGuildCommand(guild: Nullable<CommandoGuildResolvable>, command: Command, settings: Settings): void {
        if (typeof settings[`cmd-${command.name}`] === 'undefined') return;
        command.setEnabledIn(guild ?? null, !!settings[`cmd-${command.name}`], true);
    }

    /**
     * Sets up a command group's status in a guild from the guild's settings
     * @param guild - Guild to set the status in
     * @param group - Group to set the status of
     * @param settings - Settings of the guild
     */
    protected setupGuildGroup(guild: Nullable<CommandoGuildResolvable>, group: CommandGroup, settings: Settings): void {
        if (typeof settings[`grp-${group.id}`] === 'undefined') return;
        group.setEnabledIn(guild ?? null, !!settings[`grp-${group.id}`], true);
    }

    /**
     * Updates a global setting on all other shards if using the {@link ShardingManager}.
     * @param key - Key of the setting to update
     * @param value - Value of the setting
     */
    protected updateOtherShards<K extends keyof Settings>(key: K, value: Settings[K] | undefined): void {
        if (!this.isReady()) return;
        const { shard } = this.client;
        if (!shard) return;

        const stringKey = JSON.stringify(key);
        const stringValue = typeof value !== 'undefined' ? JSON.stringify(value) : 'undefined';

        // @ts-expect-error: client type override
        shard.broadcastEval((client: CommandoClient) => {
            const { ids } = shard;
            if (!client.shard?.ids.some(id => ids.includes(id)) && client.provider && client.provider.settings) {
                let global = client.provider.settings.get('global');
                if (!global) {
                    global = {};
                    client.provider.settings.set('global', global);
                }
                // @ts-expect-error: only write inside the package
                global[stringKey] = stringValue;
            }
        });
    }
}
