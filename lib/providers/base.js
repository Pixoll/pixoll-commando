"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/** Loads and stores settings associated with guilds */
class SettingProvider {
    constructor() {
        if (this.constructor.name === 'SettingProvider') {
            throw new Error('The base SettingProvider cannot be instantiated.');
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm92aWRlcnMvYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUFtQztBQUluQyx1REFBdUQ7QUFDdkQsTUFBOEIsZUFBZTtJQUN6QztRQUNJLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssaUJBQWlCLEVBQUU7WUFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0wsQ0FBQztJQTJDRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUE4QjtRQUNuRCxJQUFJLEtBQUssWUFBWSxrQkFBSztZQUFFLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM1QyxJQUFJLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxLQUFLLElBQUk7WUFBRSxPQUFPLFFBQVEsQ0FBQztRQUMxRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQzlELE1BQU0sSUFBSSxTQUFTLENBQUMsaUZBQWlGLENBQUMsQ0FBQztJQUMzRyxDQUFDO0NBQ0o7QUEzREQsa0NBMkRDIn0=