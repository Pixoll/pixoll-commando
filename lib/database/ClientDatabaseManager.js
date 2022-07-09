"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = __importDefault(require("./DatabaseManager"));
const schemas_1 = __importDefault(require("./util/schemas"));
/** The client's database manager (MongoDB) */
class ClientDatabaseManager {
    /** Client for this database */
    client;
    disabled;
    errors;
    faq;
    prefixes;
    reminders;
    todo;
    /**
     * @param client - The client this database is for
     */
    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });
        this.disabled = new DatabaseManager_1.default(schemas_1.default.disabled);
        this.errors = new DatabaseManager_1.default(schemas_1.default.errors);
        this.faq = new DatabaseManager_1.default(schemas_1.default.faq);
        this.prefixes = new DatabaseManager_1.default(schemas_1.default.prefixes);
        this.reminders = new DatabaseManager_1.default(schemas_1.default.reminders);
        this.todo = new DatabaseManager_1.default(schemas_1.default.todo);
    }
    /**
     * Initializes the caching of this client's data
     * @param data - The data to assign to the client
     */
    init(data) {
        for (const [name, schema] of data) {
            // @ts-expect-error: no string index
            const dbManager = this[name];
            if (!dbManager)
                continue;
            dbManager.cache = schema;
        }
        return this;
    }
}
exports.default = ClientDatabaseManager;
//# sourceMappingURL=ClientDatabaseManager.js.map