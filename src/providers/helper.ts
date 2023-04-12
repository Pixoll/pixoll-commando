import CommandoClient from '../client';
import CommandoGuild from '../extensions/guild';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type SettingProvider from './base';

/** Helper class to use {@link SettingProvider} methods for a specific Guild */
export default class GuildSettingsHelper {
    /** Client to use the provider of */
    declare public readonly client: CommandoClient;
    /** Guild the settings are for */
    public guild: CommandoGuild | null;

    /**
     * @param client - Client to use the provider of
     * @param guild - Guild the settings are for
     */
    protected constructor(client: CommandoClient, guild: CommandoGuild | null) {
        Object.defineProperty(this, 'client', { value: client });
        this.guild = guild;
    }

    /**
     * Gets a setting in the guild
     * @param key - Name of the setting
     * @param defaultValue - Value to default to if the setting isn't set
     * @see {@link SettingProvider.get SettingProvider#get}
     */
    public get<T>(key: string, defaultValue?: T): T {
        if (!this.client.provider) throw new Error('No settings provider is available.');
        return this.client.provider.get(this.guild, key, defaultValue) as T;
    }

    /**
     * Sets a setting for the guild
     * @param key - Name of the setting
     * @param value - Value of the setting
     * @returns New value of the setting
     * @see {@link SettingProvider.set SettingProvider#set}
     */
    public set<T>(key: string, value: T): Promise<T> {
        if (!this.client.provider) throw new Error('No settings provider is available.');
        return this.client.provider.set(this.guild, key, value) as Promise<T>;
    }

    /**
     * Removes a setting from the guild
     * @param key - Name of the setting
     * @returns Old value of the setting
     * @see {@link SettingProvider.remove SettingProvider#remove}
     */
    public remove<T>(key: string): Promise<T> {
        if (!this.client.provider) throw new Error('No settings provider is available.');
        return this.client.provider.remove(this.guild, key) as Promise<T>;
    }

    /**
     * Removes all settings in the guild
     * @see {@link SettingProvider.clear SettingProvider#clear}
     */
    public async clear(): Promise<void> {
        if (!this.client.provider) throw new Error('No settings provider is available.');
        await this.client.provider.clear(this.guild);
        return;
    }
}
