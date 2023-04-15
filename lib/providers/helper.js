"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Helper class to use {@link SettingProvider} methods for a specific Guild */
class GuildSettingsHelper {
    /** Guild the settings are for */
    guild;
    /**
     * @param client - Client to use the provider of
     * @param guild - Guild the settings are for
     */
    constructor(client, guild) {
        Object.defineProperty(this, 'client', { value: client });
        this.guild = guild;
    }
    /**
     * Gets a setting in the guild
     * @param key - Name of the setting
     * @param defaultValue - Value to default to if the setting isn't set
     * @see {@link SettingProvider.get SettingProvider#get}
     */
    get(key, defaultValue) {
        const provider = this.client.provider;
        if (!provider)
            throw new Error('No settings provider is available.');
        return provider.get(this.guild, key, defaultValue);
    }
    /**
     * Sets a setting for the guild
     * @param key - Name of the setting
     * @param value - Value of the setting
     * @returns New value of the setting
     * @see {@link SettingProvider.set SettingProvider#set}
     */
    set(key, value) {
        const provider = this.client.provider;
        if (!provider)
            throw new Error('No settings provider is available.');
        return provider.set(this.guild, key, value);
    }
    /**
     * Removes a setting from the guild
     * @param key - Name of the setting
     * @returns Old value of the setting
     * @see {@link SettingProvider.remove SettingProvider#remove}
     */
    remove(key) {
        const provider = this.client.provider;
        if (!provider)
            throw new Error('No settings provider is available.');
        return provider.remove(this.guild, key);
    }
    /**
     * Removes all settings in the guild
     * @see {@link SettingProvider.clear SettingProvider#clear}
     */
    async clear() {
        if (!this.client.provider)
            throw new Error('No settings provider is available.');
        await this.client.provider.clear(this.guild);
    }
}
exports.default = GuildSettingsHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Byb3ZpZGVycy9oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSwrRUFBK0U7QUFDL0UsTUFBcUIsbUJBQW1CO0lBR3BDLGlDQUFpQztJQUMxQixLQUFLLENBQXVCO0lBRW5DOzs7T0FHRztJQUNILFlBQXNCLE1BQXNCLEVBQUUsS0FBMkI7UUFDckUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksR0FBRyxDQUFJLEdBQVcsRUFBRSxZQUFnQjtRQUN2QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQXlDLENBQUM7UUFDdkUsSUFBSSxDQUFDLFFBQVE7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDckUsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBTSxDQUFDO0lBQzVELENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxHQUFHLENBQUksR0FBVyxFQUFFLEtBQVE7UUFDL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUF5QyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxRQUFRO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQWUsQ0FBQztJQUM5RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUksR0FBVztRQUN4QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQXlDLENBQUM7UUFDdkUsSUFBSSxDQUFDLFFBQVE7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDckUsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFlLENBQUM7SUFDMUQsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxLQUFLO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUNqRixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakQsQ0FBQztDQUNKO0FBNURELHNDQTREQyJ9