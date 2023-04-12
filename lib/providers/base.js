"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/** Loads and stores settings associated with guilds */
class SettingProvider {
    /** Settings cached in memory, mapped by guild ID (or 'global') */
    settings;
    constructor() {
        this.settings = new Map();
    }
    /**
     * Obtains the ID of the provided guild, or throws an error if it isn't valid
     * @param guild - Guild to get the ID of
     * @returns ID of the guild, or 'global'
     */
    static getGuildID(guild) {
        if (guild instanceof discord_js_1.Guild)
            return guild.id;
        if (guild === 'global' || guild === null)
            return 'global';
        if (typeof guild === 'string' && !isNaN(+guild))
            return guild;
        throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
    }
}
exports.default = SettingProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm92aWRlcnMvYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUE4QztBQUk5Qyx1REFBdUQ7QUFDdkQsTUFBOEIsZUFBZTtJQUN6QyxrRUFBa0U7SUFDeEQsUUFBUSxDQUF3QjtJQUUxQztRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBaUREOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQXFDO1FBQzFELElBQUksS0FBSyxZQUFZLGtCQUFLO1lBQUUsT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzVDLElBQUksS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSTtZQUFFLE9BQU8sUUFBUSxDQUFDO1FBQzFELElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDOUQsTUFBTSxJQUFJLFNBQVMsQ0FBQyxpRkFBaUYsQ0FBQyxDQUFDO0lBQzNHLENBQUM7Q0FDSjtBQWxFRCxrQ0FrRUMifQ==