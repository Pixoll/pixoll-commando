import CommandoClient from '../client';
/**
 * Connects to MongoDB, caches the database and loads all client modules.
 * @param client - The client the database is for.
 */
export default function initializeDB(client: CommandoClient<true>): Promise<void>;
