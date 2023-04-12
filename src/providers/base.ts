import { Guild } from 'discord.js';
import CommandoClient from '../client';
import { CommandoGuildResolvable } from '../discord.overrides';

/** Loads and stores settings associated with guilds */
export default abstract class SettingProvider {
    public constructor() {
        if (this.constructor.name === 'SettingProvider') {
            throw new Error('The base SettingProvider cannot be instantiated.');
        }
    }

    /**
     * Initialises the provider by connecting to databases and/or caching all data in memory.
     * {@link CommandoClient#setProvider} will automatically call this once the client is ready.
     * @param client - Client that will be using the provider
     */
    public abstract init(client: CommandoClient): Promise<void>;

    /** Destroys the provider, removing any event listeners. */
    public abstract destroy(): Promise<void>;

    /**
     * Obtains a setting for a guild
     * @param guild - Guild the setting is associated with (or 'global')
     * @param key - Name of the setting
     * @param defaultValue - Value to default to if the setting isn't set on the guild
     */
    public abstract get<T>(guild: CommandoGuildResolvable | null, key: string, defaultValue?: T): T;

    /**
     * Sets a setting for a guild
     * @param guild - Guild to associate the setting with (or 'global')
     * @param key - Name of the setting
     * @param value - Value of the setting
     * @returns New value of the setting
     */
    public abstract set<T>(guild: CommandoGuildResolvable | null, key: string, value: T): Promise<T>;

    /**
     * Removes a setting from a guild
     * @param guild - Guild the setting is associated with (or 'global')
     * @param key - Name of the setting
     * @returns Old value of the setting
     */
    public abstract remove<T>(guild: CommandoGuildResolvable | null, key: string): Promise<T>;

    /**
     * Removes all settings in a guild
     * @param guild - Guild to clear the settings of
     */
    public abstract clear(guild: CommandoGuildResolvable | null): Promise<void>;

    /**
     * Obtains the ID of the provided guild, or throws an error if it isn't valid
     * @param guild - Guild to get the ID of
     * @returns ID of the guild, or 'global'
     */
    public static getGuildID(guild: CommandoGuildResolvable): string {
        if (guild instanceof Guild) return guild.id;
        if (guild === 'global' || guild === null) return 'global';
        if (typeof guild === 'string' && !isNaN(+guild)) return guild;
        throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
    }
}
