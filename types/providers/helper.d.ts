import CommandoClient from '../client';
import CommandoGuild from '../extensions/guild';
/** Helper class to use {@link SettingProvider} methods for a specific Guild */
export default class GuildSettingsHelper {
    /** Client to use the provider of */
    readonly client: CommandoClient;
    /** Guild the settings are for */
    guild: CommandoGuild | null;
    /**
     * @param client - Client to use the provider of
     * @param guild - Guild the settings are for
     */
    protected constructor(client: CommandoClient, guild: CommandoGuild | null);
    /**
     * Gets a setting in the guild
     * @param key - Name of the setting
     * @param defaultValue - Value to default to if the setting isn't set
     * @see {@link SettingProvider.get SettingProvider#get}
     */
    get<T>(key: string, defaultValue?: T): T;
    /**
     * Sets a setting for the guild
     * @param key - Name of the setting
     * @param value - Value of the setting
     * @returns New value of the setting
     * @see {@link SettingProvider.set SettingProvider#set}
     */
    set<T>(key: string, value: T): Promise<T>;
    /**
     * Removes a setting from the guild
     * @param key - Name of the setting
     * @returns Old value of the setting
     * @see {@link SettingProvider.remove SettingProvider#remove}
     */
    remove<T>(key: string): Promise<T>;
    /**
     * Removes all settings in the guild
     * @see {@link SettingProvider.clear SettingProvider#clear}
     */
    clear(): Promise<void>;
}
