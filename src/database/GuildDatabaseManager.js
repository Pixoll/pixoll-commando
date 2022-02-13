const DatabaseManager = require('./DatabaseManager');
const schemas = require('./util/schemas');

/** All guilds' database manager (MongoDB) */
class GuildDatabaseManager {
    /**
     * @param {CommandoGuild} guild The guild this database is for
     */
    constructor(guild) {
        /**
         * Guild for this database
         * @type {CommandoGuild}
         * @readonly
         */
        this.guild = guild;

        /** @type {DatabaseManager} */
        this.active = new DatabaseManager(schemas.active, guild);
        /** @type {DatabaseManager} */
        this.afk = new DatabaseManager(schemas.afk, guild);
        /** @type {DatabaseManager} */
        this.disabled = new DatabaseManager(schemas.disabled, guild);
        /** @type {DatabaseManager} */
        this.mcIps = new DatabaseManager(schemas.mcIp, guild);
        /** @type {DatabaseManager} */
        this.moderations = new DatabaseManager(schemas.moderations, guild);
        /** @type {DatabaseManager} */
        this.modules = new DatabaseManager(schemas.modules, guild);
        /** @type {DatabaseManager} */
        this.prefixes = new DatabaseManager(schemas.prefixes, guild);
        /** @type {DatabaseManager} */
        this.polls = new DatabaseManager(schemas.polls, guild);
        /** @type {DatabaseManager} */
        this.reactionRoles = new DatabaseManager(schemas.reactionRoles, guild);
        /** @type {DatabaseManager} */
        this.rules = new DatabaseManager(schemas.rules, guild);
        /** @type {DatabaseManager} */
        this.setup = new DatabaseManager(schemas.setup, guild);
        /** @type {DatabaseManager} */
        this.stickyRoles = new DatabaseManager(schemas.stickyRoles, guild);
        /** @type {DatabaseManager} */
        this.welcome = new DatabaseManager(schemas.welcome, guild);
    }

    /**
     * Initializes the caching of this guild's data
     * @param {Collection<string, Collection<string, object>>} data The data to assignate to the guild
     * @private
     */
    init(data) {
        for (const [name, schema] of data) {
            if (!this[name]) continue;
            this[name].cache = schema;
        }
        return this;
    }
}

module.exports = GuildDatabaseManager;
