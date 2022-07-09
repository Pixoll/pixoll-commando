import { Collection } from 'discord.js';
import CommandoClient from '../client';
import DatabaseManager from './DatabaseManager';
import schemas from './util/schemas';
import { DisabledSchema, ErrorSchema, FaqSchema, PrefixSchema, ReminderSchema, TodoSchema } from './util/schemas';

interface DefaultDocument {
    _id: string;
    guild?: string;
}

/** The client's database manager (MongoDB) */
export default class ClientDatabaseManager {
    /** Client for this database */
    public readonly client!: CommandoClient;
    public disabled: DatabaseManager<DisabledSchema>;
    public errors: DatabaseManager<ErrorSchema>;
    public faq: DatabaseManager<FaqSchema>;
    public prefixes: DatabaseManager<PrefixSchema>;
    public reminders: DatabaseManager<ReminderSchema>;
    public todo: DatabaseManager<TodoSchema>;

    /**
     * @param client - The client this database is for
     */
    public constructor(client: CommandoClient) {
        Object.defineProperty(this, 'client', { value: client });

        this.disabled = new DatabaseManager(schemas.disabled);
        this.errors = new DatabaseManager(schemas.errors);
        this.faq = new DatabaseManager(schemas.faq);
        this.prefixes = new DatabaseManager(schemas.prefixes);
        this.reminders = new DatabaseManager(schemas.reminders);
        this.todo = new DatabaseManager(schemas.todo);
    }

    /**
     * Initializes the caching of this client's data
     * @param data - The data to assign to the client
     */
    protected init(data: Collection<string, Collection<string, DefaultDocument>>): this {
        for (const [name, schema] of data) {
            // @ts-expect-error: no string index
            const dbManager = this[name] as DatabaseManager<DefaultDocument>;
            if (!dbManager) continue;
            dbManager.cache = schema;
        }
        return this;
    }
}
