const DatabaseManager = require('./DatabaseManager');
const schemas = require('./util/schemas');

/** The client's database manager (MongoDB) */
class ClientDatabaseManager {
    /**
     * @param {CommandoClient} client The client this database is for
     */
    constructor(client) {
        /**
         * Client for this database
         * @type {CommandoClient}
         * @readonly
         */
        this.client = client;

        /** @type {DatabaseManager} */
        this.disabled = new DatabaseManager(schemas.disabled);
        /** @type {DatabaseManager} */
        this.errors = new DatabaseManager(schemas.errors);
        /** @type {DatabaseManager} */
        this.faq = new DatabaseManager(schemas.faq);
        /** @type {DatabaseManager} */
        this.prefixes = new DatabaseManager(schemas.prefixes);
        /** @type {DatabaseManager} */
        this.reminders = new DatabaseManager(schemas.reminders);
        /** @type {DatabaseManager} */
        this.todo = new DatabaseManager(schemas.todo);
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

module.exports = ClientDatabaseManager;
