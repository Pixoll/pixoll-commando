import { Collection, LimitedCollection } from 'discord.js';
import CommandoClient from '../client';
import DatabaseManager, { DefaultDocument } from './DatabaseManager';
import Schemas, { DisabledSchema, ErrorSchema, FaqSchema, PrefixSchema, ReminderSchema, TodoSchema } from './Schemas';

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

        this.disabled = new DatabaseManager(Schemas.DisabledModel);
        this.errors = new DatabaseManager(Schemas.ErrorsModel);
        this.faq = new DatabaseManager(Schemas.FaqModel);
        this.prefixes = new DatabaseManager(Schemas.PrefixesModel);
        this.reminders = new DatabaseManager(Schemas.RemindersModel);
        this.todo = new DatabaseManager(Schemas.TodoModel);
    }

    /**
     * Initializes the caching of this client's data
     * @param data - The data to assign to the client
     */
    protected init(data: Collection<string, LimitedCollection<string, DefaultDocument>>): this {
        for (const [name, schema] of data) {
            // @ts-expect-error: no string index
            const dbManager = this[name] as DatabaseManager<DefaultDocument>;
            if (!dbManager) continue;
            dbManager.cache = schema;
        }
        return this;
    }
}
