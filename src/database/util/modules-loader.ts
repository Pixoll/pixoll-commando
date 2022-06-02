import { Collection } from 'discord.js';
import { connect } from 'mongoose';
import requireAll from 'require-all';
import * as schemas from './schemas';
import { removeDashes } from '../../util';
import CommandoClient from '../../client';

type Module = (client: CommandoClient) => Promise<unknown>;
interface DefaultDocument {
    _id: string;
    guild?: string;
}

/**
 * Handlers for the whole database of the client.
 * @param client - The client these handlers are for
 */
export default async function modulesLoader(client: CommandoClient): Promise<void> {
    const { database, databases, guilds, options } = client;
    const { mongoDbURI, modulesDir, excludeModules } = options;
    const { MONGO_DB_URI } = process.env;

    if (!MONGO_DB_URI && !mongoDbURI) return;
    await connect(mongoDbURI ?? MONGO_DB_URI!, { keepAlive: true });
    client.emit('debug', 'Established database connection');

    // Caches all the database in memory
    const data = new Collection() as Collection<string, Collection<string, DefaultDocument>>;
    for (const schema of Object.values(schemas)) {
        const objs = await schema.find({});
        const name = removeDashes(schema.collection.name);
        const entries = objs.map(obj => ([`${obj._id}`, obj])) as [string, DefaultDocument][];
        const coll = new Collection(entries);
        data.set(name, coll);
    }

    const clientData = data.mapValues(coll => coll.filter(doc => typeof doc.guild !== 'string'));
    // @ts-expect-error: init is protected in ClientDatabaseManager
    database.init(clientData);

    for (const guild of guilds.cache.toJSON()) {
        const guildData = data.mapValues(coll => coll.filter(doc => doc.guild === guild.id));
        // @ts-expect-error: init is protected in GuildDatabaseManager
        guild.database.init(guildData);
        databases.set(guild.id, guild.database);
    }
    client.emit('debug', 'Database caching process finished');

    // Loads all the bot's features
    if (!modulesDir) return;
    const features = requireAll(modulesDir) as Record<string, Record<string, Module>>;
    for (const folderName of Object.keys(features)) {
        const folder = features[folderName];
        if (typeof folder !== 'object') continue;
        for (const fileName in folder) {
            if (excludeModules?.includes(fileName)) continue;
            const file = folder[fileName];
            await file(client);
            client.emit('debug', `Loaded feature ${folderName}/${fileName}`);
        }
    }
    client.emit('debug', 'Loaded client features');
    client.emit('databaseReady', client);
}
