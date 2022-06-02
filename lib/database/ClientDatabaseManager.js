"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = __importDefault(require("./DatabaseManager"));
const schemas = __importStar(require("./util/schemas"));
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
        this.disabled = new DatabaseManager_1.default(schemas.disabled);
        this.errors = new DatabaseManager_1.default(schemas.errors);
        this.faq = new DatabaseManager_1.default(schemas.faq);
        this.prefixes = new DatabaseManager_1.default(schemas.prefixes);
        this.reminders = new DatabaseManager_1.default(schemas.reminders);
        this.todo = new DatabaseManager_1.default(schemas.todo);
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