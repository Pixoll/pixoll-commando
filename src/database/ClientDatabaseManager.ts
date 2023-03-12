import { Collection, LimitedCollection } from 'discord.js';
import CommandoClient from '../client';
import DatabaseManager from './DatabaseManager';
import Schemas, {
    AnySchema,
    DisabledSchema,
    ErrorSchema,
    FaqSchema,
    PrefixSchema,
    ReminderSchema,
    TodoSchema,
} from './Schemas';

type SchemaKey = Exclude<keyof ClientDatabaseManager, 'client'>;

/** The client's database manager (MongoDB) */
export default class ClientDatabaseManager {
    /** Client for this database */
    declare public readonly client: CommandoClient;
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
    protected async init(data: Collection<string, LimitedCollection<string, AnySchema>>): Promise<void> {
        for (const [name, schema] of data) {
            const dbManager = this[name as SchemaKey];
            if (!dbManager) continue;
            // @ts-expect-error: AnySchema not assignable to individual schema types
            dbManager.cache = schema;
        }
    }
}
