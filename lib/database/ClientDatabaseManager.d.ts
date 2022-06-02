import { Collection } from 'discord.js';
import CommandoClient from '../client';
import DatabaseManager from './DatabaseManager';
import { DisabledSchema, ErrorSchema, FaqSchema, PrefixSchema, ReminderSchema, TodoSchema } from './util/schemas';
interface DefaultDocument {
    _id: string;
    guild?: string;
}
/** The client's database manager (MongoDB) */
export default class ClientDatabaseManager {
    /** Client for this database */
    readonly client: CommandoClient;
    disabled: DatabaseManager<DisabledSchema>;
    errors: DatabaseManager<ErrorSchema>;
    faq: DatabaseManager<FaqSchema>;
    prefixes: DatabaseManager<PrefixSchema>;
    reminders: DatabaseManager<ReminderSchema>;
    todo: DatabaseManager<TodoSchema>;
    /**
     * @param client - The client this database is for
     */
    constructor(client: CommandoClient);
    /**
     * Initializes the caching of this client's data
     * @param data - The data to assign to the client
     */
    protected init(data: Collection<string, Collection<string, DefaultDocument>>): this;
}
export {};
