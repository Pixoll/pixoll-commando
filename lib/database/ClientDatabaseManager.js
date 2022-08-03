"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = __importDefault(require("./DatabaseManager"));
const Schemas_1 = __importDefault(require("./Schemas"));
/** The client's database manager (MongoDB) */
class ClientDatabaseManager {
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
        this.disabled = new DatabaseManager_1.default(Schemas_1.default.DisabledModel);
        this.errors = new DatabaseManager_1.default(Schemas_1.default.ErrorsModel);
        this.faq = new DatabaseManager_1.default(Schemas_1.default.FaqModel);
        this.prefixes = new DatabaseManager_1.default(Schemas_1.default.PrefixesModel);
        this.reminders = new DatabaseManager_1.default(Schemas_1.default.RemindersModel);
        this.todo = new DatabaseManager_1.default(Schemas_1.default.TodoModel);
    }
    /**
     * Initializes the caching of this client's data
     * @param data - The data to assign to the client
     */
    init(data) {
        for (const [name, schema] of data) {
            const dbManager = this[name];
            if (!dbManager)
                continue;
            // @ts-expect-error: AnySchema not assignable to individual schema types
            dbManager.cache = schema;
        }
        return this;
    }
}
exports.default = ClientDatabaseManager;
//# sourceMappingURL=ClientDatabaseManager.js.map