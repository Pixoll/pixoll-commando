"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
/** Uses an SQLite database to store settings with guilds */
class SQLiteProvider extends base_1.default {
    /** Database that will be used for storing/retrieving settings */
    db;
    /** Listeners on the Client, mapped by the event name */
    listeners;
    /** Prepared statement to insert or replace a settings row */
    insertOrReplaceStatement;
    /** Prepared statement to delete an entire settings row */
    deleteStatement;
    /**
     * @param db - Database for the provider
     */
    constructor(db) {
        super();
        Object.defineProperty(this, 'client', { value: null, writable: true });
        this.db = db;
        this.listeners = new Map();
        this.insertOrReplaceStatement = null;
        this.deleteStatement = null;
    }
    isReady() {
        return !!this.client;
    }
    async init(client) {
        this.client = client;
        await this.db.run('CREATE TABLE IF NOT EXISTS settings (guild INTEGER PRIMARY KEY, settings TEXT)');
        // Load all settings
        const rows = await this.db.all('SELECT CAST(guild as TEXT) as guild, settings FROM settings');
        for (const row of rows) {
            let settings;
            try {
                settings = JSON.parse(row.settings);
            }
            catch (err) {
                client.emit('warn', `SQLiteProvider couldn't parse the settings stored for guild ${row.guild}.`);
                continue;
            }
            const guild = row.guild !== '0' ? row.guild : 'global';
            this.settings.set(guild, settings);
            if (guild !== 'global' && !client.guilds.cache.has(row.guild))
                continue;
            this.setupGuild(guild, settings);
        }
        // Prepare statements
        const statements = await Promise.all([
            this.db.prepare('INSERT OR REPLACE INTO settings VALUES(?, ?)'),
            this.db.prepare('DELETE FROM settings WHERE guild = ?'),
        ]);
        this.insertOrReplaceStatement = statements[0];
        this.deleteStatement = statements[1];
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
                this.setupGuildCommand(client.guilds.cache.get(guild), command, settings);
            }
        })
            .set('groupRegister', group => {
            for (const [guild, settings] of this.settings) {
                if (guild !== 'global' && !client.guilds.cache.has(guild))
                    continue;
                this.setupGuildGroup(client.guilds.cache.get(guild), group, settings);
            }
        });
        for (const [event, listener] of this.listeners)
            client.on(event, listener);
    }
    async destroy() {
        // Finalize prepared statements
        await Promise.all([
            this.insertOrReplaceStatement?.finalize(),
            this.deleteStatement?.finalize(),
        ]);
        // Remove all listeners from the client
        for (const [event, listener] of this.listeners) {
            this.client?.removeListener(event, listener);
        }
        this.listeners.clear();
    }
    get(guild, key, defaultValue) {
        const settings = this.settings.get(base_1.default.getGuildID(guild ?? null));
        return settings ? typeof settings[key] !== 'undefined' ? settings[key] : defaultValue : defaultValue;
    }
    async set(guild, key, value) {
        guild = base_1.default.getGuildID(guild ?? null);
        let settings = this.settings.get(guild);
        if (!settings) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            settings = {};
            this.settings.set(guild, settings);
        }
        settings[key] = value;
        await this.insertOrReplaceStatement?.run(guild !== 'global' ? guild : 0, JSON.stringify(settings));
        if (guild === 'global')
            this.updateOtherShards(key, value);
        return value;
    }
    async remove(guild, key) {
        guild = base_1.default.getGuildID(guild ?? null);
        const settings = this.settings.get(guild);
        if (!settings || typeof settings[key] === 'undefined')
            return;
        const value = settings[key];
        // @ts-expect-error: setting the value to undefined is intended behaviour
        settings[key] = undefined;
        await this.insertOrReplaceStatement?.run(guild !== 'global' ? guild : 0, JSON.stringify(settings));
        if (guild === 'global')
            this.updateOtherShards(key, undefined);
        return value;
    }
    async clear(guild) {
        guild = base_1.default.getGuildID(guild ?? null);
        if (!this.settings.has(guild))
            return;
        this.settings.delete(guild);
        await this.deleteStatement?.run(guild !== 'global' ? guild : 0);
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
        if (typeof guild !== 'string')
            throw new TypeError('The guild must be a guild ID or "global".');
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
            if (!settings || client.shard?.ids.some(id => ids.includes(id)))
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
exports.default = SQLiteProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb3ZpZGVycy9zcWxpdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSxrREFBcUM7QUEwQnJDLDREQUE0RDtBQUM1RCxNQUFxQixjQUduQixTQUFRLGNBQXlCO0lBTS9CLGlFQUFpRTtJQUMxRCxFQUFFLENBQWlCO0lBQzFCLHdEQUF3RDtJQUM5QyxTQUFTLENBQWU7SUFDbEMsNkRBQTZEO0lBQ25ELHdCQUF3QixDQUF5QjtJQUMzRCwwREFBMEQ7SUFDaEQsZUFBZSxDQUF5QjtJQUVsRDs7T0FFRztJQUNILFlBQW1CLEVBQWtCO1FBQ2pDLEtBQUssRUFBRSxDQUFDO1FBRVIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0lBQ2hDLENBQUM7SUFFTSxPQUFPO1FBQ1YsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRU0sS0FBSyxDQUFDLElBQUksQ0FBQyxNQUE0QjtRQUMxQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQXlDLENBQUM7UUFDeEQsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxnRkFBZ0YsQ0FBQyxDQUFDO1FBRXBHLG9CQUFvQjtRQUNwQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7UUFDOUYsS0FBSyxNQUFN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