import CommandoClient from '../client';
import { CommandoGuildResolvable } from '../discord.overrides';
/** Loads and stores settings associated with guilds */
export default abstract class SettingProvider {
    constructor();
    /**
     * Initialises the provider by connecting to databases and/or caching all data in memory.
     * {@link CommandoClient#setProvider} will automatically call this once the client is ready.
     * @param client - Client that will be using the provider
     */
    abstract init(client: CommandoClient): Promise<void>;
    /** Destroys the provider, removing any event listeners. */
    abstract destroy(): Promise<void>;
    /**
     * Obtains a setting for a guild
     * @param guild - Guild the setting is associated with (or 'global')
     * @param key - Name of the setting
     * @param defaultValue - Value to default to if the setting isn't set on the guild
     */
    abstract get<T>(guild: CommandoGuildResolvable | null, key: string, defaultValue?: T): T;
    /**
     * Sets a setting for a guild
     * @param guild - Guild to associate the setting with (or 'global')
     * @param key - Name of the setting
     * @param value - Value of the setting
     * @returns New value of the setting
     */
    abstract set<T>(guild: CommandoGuildResolvable | null, key: string, value: T): Promise<T>;
    /**
     * Removes a setting from a guild
     * @param guild - Guild the setting is associated with (or 'global')
     * @param key - Name of the setting
     * @returns Old value of the setting
     */
    abstract remove<T>(guild: CommandoGuildResolvable | null, key: string): Promise<T>;
    /**
     * Removes all settings in a guild
     * @param guild - Guild to clear the settings of
     */
    abstract clear(guild: CommandoGuildResolvable | null): Promise<void>;
    /**
     * Obtains the ID of the provided guild, or throws an error if it isn't valid
     * @param guild - Guild to get the ID of
     * @returns ID of the guild, or 'global'
     */
    static getGuildID(guild: CommandoGuildResolvable): string;
}
