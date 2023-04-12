"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
/** Uses an SQLite database to store settings with guilds */
class SyncSQLiteProvider extends base_1.default {
    /** Database that will be used for storing/retrieving settings */
    connection;
    /** Listeners on the Client, mapped by the event name */
    listeners;
    /** Prepared statement to insert or replace a settings row */
    insertOrReplaceStatement;
    /** Prepared statement to delete an entire settings row */
    deleteStatement;
    /**
     * @param connection - Database Connection for the provider
     */
    constructor(connection) {
        super();
        Object.defineProperty(this, 'client', { value: null, writable: true });
        this.connection = connection;
        this.listeners = new Map();
        this.insertOrReplaceStatement = null;
        this.deleteStatement = null;
    }
    isReady() {
        return !!this.client;
    }
    init(client) {
        this.client = client;
        // Just for type narrowing
        if (!this.isReady())
            return;
        this.connection.prepare('CREATE TABLE IF NOT EXISTS settings (guild INTEGER PRIMARY KEY, settings TEXT)').run();
        // Load all settings
        const rows = this.connection.prepare('SELECT CAST(guild as TEXT) as guild, settings FROM settings')
            .all();
        for (const row of rows) {
            let settings;
            try {
                settings = JSON.parse(row.settings);
            }
            catch (err) {
                client.emit('warn', `SyncSQLiteProvider couldn't parse the settings stored for guild ${row.guild}.`);
                continue;
            }
            const guild = row.guild !== '0' ? row.guild : 'global';
            this.settings.set(guild, settings);
            if (guild !== 'global' && !client.guilds.cache.has(row.guild))
                continue;
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
            this.set(guild, `cmd-${command.name}`, enabled);
        })
            .set('groupStatusChange', (guild, group, enabled) => {
            this.set(guild, `grp-${group.id}`, enabled);
        })
            .set('guildCreate', guild => {
            const settings = this.settings.get(guild.id);
            if (!settings)
                return;
            this.setupGuild(guild.id, settings);
        })
            .set('commandRegister', command => {
            for (const [guild, settings] of this.settings) {
                if (guild !== 'global' && !client.guilds.cache.has(guild))
                    continue;
                this.setupGuildCommand(client.guilds.resolve(guild), command, settings);
            }
        })
            .set('groupRegister', group => {
            for (const [guild, settings] of this.settings) {
                if (guild !== 'global' && !client.guilds.cache.has(guild))
                    continue;
                this.setupGuildGroup(client.guilds.resolve(guild), group, settings);
            }
        });
        for (const [event, listener] of this.listeners)
            client.on(event, listener);
    }
    destroy() {
        // Remove all listeners from the client
        for (const [event, listener] of this.listeners) {
            this.client?.removeListener(event, listener);
        }
        this.listeners.clear();
    }
    get(guild, key, defaultValue) {
        const settings = this.settings.get(base_1.default.getGuildID(guild ?? null));
        return settings
            ? (typeof settings[key] !== 'undefined'
                ? settings[key]
                : defaultValue)
            : defaultValue;
    }
    set(guild, key, value) {
        guild = base_1.default.getGuildID(guild ?? null);
        let settings = this.settings.get(guild);
        if (!settings) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            settings = {};
            this.settings.set(guild, settings);
        }
        settings[key] = value;
        this.insertOrReplaceStatement?.run(guild !== 'global' ? guild : 0, JSON.stringify(settings));
        if (guild === 'global')
            this.updateOtherShards(key, value);
        return value;
    }
    remove(guild, key) {
        guild = base_1.default.getGuildID(guild ?? null);
        const settings = this.settings.get(guild);
        if (!settings || typeof settings[key] === 'undefined')
            return;
        const value = settings[key];
        // @ts-expect-error: setting the value to undefined is intended behaviour
        settings[key] = undefined;
        this.insertOrReplaceStatement?.run(guild !== 'global' ? guild : 0, JSON.stringify(settings));
        if (guild === 'global')
            this.updateOtherShards(key, undefined);
        return value;
    }
    clear(guild) {
        guild = base_1.default.getGuildID(guild ?? null);
        if (!this.settings.has(guild))
            return;
        this.settings.delete(guild);
        this.deleteStatement?.run(guild !== 'global' ? guild : 0);
    }
    /**
     * Loads all settings for a guild
     * @param guild - Guild ID to load the settings of (or 'global')
     * @param settings - Settings to load
     */
    setupGuild(guild, settings) {
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
            if (resolvedGuild)
                resolvedGuild._prefix = settings.prefix;
            // @ts-expect-error: meant to not trigger an event
            else
                this.client._prefix = settings.prefix;
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
    setupGuildCommand(guild, command, settings) {
        if (typeof settings[`cmd-${command.name}`] === 'undefined')
            return;
        command.setEnabledIn(guild ?? null, !!settings[`cmd-${command.name}`], true);
    }
    /**
     * Sets up a command group's status in a guild from the guild's settings
     * @param guild - Guild to set the status in
     * @param group - Group to set the status of
     * @param settings - Settings of the guild
     */
    setupGuildGroup(guild, group, settings) {
        if (typeof settings[`grp-${group.id}`] === 'undefined')
            return;
        group.setEnabledIn(guild ?? null, !!settings[`grp-${group.id}`], true);
    }
    /**
     * Updates a global setting on all other shards if using the {@link ShardingManager}.
     * @param key - Key of the setting to update
     * @param value - Value of the setting
     */
    updateOtherShards(key, value) {
        if (!this.isReady())
            return;
        const { shard } = this.client;
        if (!shard)
            return;
        const { ids } = shard;
        const stringKey = JSON.stringify(key);
        const stringValue = typeof value !== 'undefined' ? JSON.stringify(value) : 'undefined';
        // @ts-expect-error: client type override
        shard.broadcastEval((client) => {
            // @ts-expect-error: settings is protected in SettingProvider
            const settings = client.provider?.settings;
            if (client.shard?.ids.some(id => ids.includes(id)) || !settings)
                return;
            let global = settings.get('global');
            if (!global) {
                global = {};
                settings.set('global', global);
            }
            global[stringKey] = stringValue;
        });
    }
}
exports.default = SyncSQLiteProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsaXRlLXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvdmlkZXJzL3NxbGl0ZS1zeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsa0RBQXFDO0FBUXJDLDREQUE0RDtBQUM1RCxNQUFxQixrQkFHbkIsU0FBUSxjQUF5QjtJQU0vQixpRUFBaUU7SUFDMUQsVUFBVSxDQUFxQjtJQUN0Qyx3REFBd0Q7SUFDOUMsU0FBUyxDQUFlO0lBQ2xDLDZEQUE2RDtJQUNuRCx3QkFBd0IsQ0FBNkI7SUFDL0QsMERBQTBEO0lBQ2hELGVBQWUsQ0FBNkI7SUFFdEQ7O09BRUc7SUFDSCxZQUFtQixVQUE4QjtRQUM3QyxLQUFLLEVBQUUsQ0FBQztRQUVSLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7UUFDckMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUVNLE9BQU87UUFDVixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxJQUFJLENBQUMsTUFBNEI7UUFDcEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUF5QyxDQUFDO1FBQ3hELDBCQUEwQjtRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUFFLE9BQU87UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsZ0ZBQWdGLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUVoSCxvQkFBb0I7UUFDcEIsTUFBTSxJQUFJLEdB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