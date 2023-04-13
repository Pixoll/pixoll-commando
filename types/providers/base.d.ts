import { Awaitable } from 'discord.js';
import CommandoClient from '../client';
import { CommandoGuildResolvable } from '../discord.overrides';
export type SettingProviderGet<Value, Default> = Default extends NonNullable<Default> ? NonNullable<Default | Value> : Default | Value;
/** Loads and stores settings associated with guilds */
export default abstract class SettingProvider<Settings extends object = Record<string, unknown>> {
    /** Settings cached in memory, mapped by guild ID (or 'global') */
    protected settings: Map<string, Settings>;
    constructor();
    /**
     * Initialises the provider by connecting to databases and/or caching all data in memory.
     * {@link CommandoClient.setProvider CommandoClient#setProvider} will automatically call this once the client is ready.
     * @param client - Client that will be using the provider
     */
    abstract init(client: CommandoClient<true>): Awaitable<void>;
    /** Destroys the provider, removing any event listeners. */
    abstract destroy(): Awaitable<void>;
    /**
     * Obtains a setting for a guild
     * @param guild - Guild the setting is associated with (or 'global')
     * @param key - Name of the setting
     * @param defaultValue - Value to default to if the setting isn't set on the guild
     */
    abstract get<K extends keyof Settings, Default extends Settings[K] | undefined>(guild: CommandoGuildResolvable | null, key: K, defaultValue?: Default): Default | Settings[K];
    /**
     * Sets a setting for a guild
     * @param guild - Guild to associate the setting with (or 'global')
     * @param key - Name of the setting
     * @param value - Value of the setting
     * @returns New value of the setting
     */
    abstract set<K extends keyof Settings>(guild: CommandoGuildResolvable | null, key: K, value: Settings[K]): Awaitable<Settings[K]>;
    /**
     * Removes a setting from a guild
     * @param guild - Guild the setting is associated with (or 'global')
     * @param key - Name of the setting
     * @returns Old value of the setting
     */
    abstract remove<K extends keyof Settings>(guild: CommandoGuildResolvable | null, key: K): Awaitable<Settings[K] | undefined>;
    /**
     * Removes all settings in a guild
     * @param guild - Guild to clear the settings of
     */
    abstract clear(guild: CommandoGuildResolvable | null): Awaitable<void>;
    /**
     * Obtains the ID of the provided guild, or throws an error if it isn't valid
     * @param guild - Guild to get the ID of
     * @returns ID of the guild, or 'global'
     */
    static getGuildID(guild: CommandoGuildResolvable | null): string;
}
