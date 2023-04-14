"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class CustomEmojiArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'guild-emoji');
    }
    validate(value, message) {
        if (typeof value === 'undefined')
            return false;
        const matches = value.match(/^(?:<a?:(\w+):)?(\d+)>?$/);
        if (matches && message.client.emojis.cache.has(matches[2]))
            return true;
        if (!message.guild)
            return false;
        const search = value.toLowerCase();
        let emojis = message.guild.emojis.cache.filter(nameFilterInexact(search));
        if (!emojis.size)
            return false;
        if (emojis.size === 1)
            return true;
        const exactEmojis = emojis.filter(nameFilterExact(search));
        if (exactEmojis.size === 1)
            return true;
        if (exactEmojis.size > 0)
            emojis = exactEmojis;
        return emojis.size <= 15
            ? `${util_1.default.disambiguation(emojis.map(emoji => (0, discord_js_1.escapeMarkdown)(emoji.name)), 'emojis')}\n`
            : 'Multiple emojis found. Please be more specific.';
    }
    parse(value, message) {
        if (!message.inGuild())
            return null;
        const matches = value.match(/^(?:<a?:(\w+):)?(\d+)>?$/);
        if (matches)
            return message.client.emojis.resolve(matches[2]);
        const search = value.toLowerCase();
        const emojis = message.guild.emojis.cache.filter(nameFilterInexact(search));
        if (!emojis.size)
            return null;
        if (emojis.size === 1)
            return emojis.first() ?? null;
        const exactEmojis = emojis.filter(nameFilterExact(search));
        if (exactEmojis.size === 1)
            return exactEmojis.first() ?? null;
        return null;
    }
}
exports.default = CustomEmojiArgumentType;
function nameFilterExact(search) {
    return (emoji) => emoji.name?.toLowerCase() === search;
}
function nameFilterInexact(search) {
    return (emoji) => !!emoji.name?.toLowerCase().includes(search);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpbGQtZW1vamkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvZ3VpbGQtZW1vamkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBa0M7QUFDbEMsbURBQTJCO0FBQzNCLDJDQUE0QztBQUs1QyxNQUFxQix1QkFBd0IsU0FBUSxjQUEyQjtJQUM1RSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBeUIsRUFBRSxPQUF3QjtRQUMvRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMvQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDeEQsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUV4RSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUVqQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQy9CLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFbkMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3hDLElBQUksV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDO1lBQUUsTUFBTSxHQUFHLFdBQVcsQ0FBQztRQUUvQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtZQUNwQixDQUFDLENBQUMsR0FBRyxjQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFBLDJCQUFjLEVBQUMsS0FBSyxDQUFDLElBQWMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUk7WUFDakcsQ0FBQyxDQUFDLGlEQUFpRCxDQUFDO0lBQzVELENBQUM7SUFFTSxLQUFLLENBQUMsS0FBYSxFQUFFLE9BQXdCO1FBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFcEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3hELElBQUksT0FBTztZQUFFLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBOEIsQ0FBQztRQUUzRixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQzlCLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDO1lBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDO1FBRXJELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDM0QsSUFBSSxXQUFXLENBQUMsSUFBSSxLQUFLLENBQUM7WUFBRSxPQUFPLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUM7UUFFL0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBMUNELDBDQTBDQztBQUVELFNBQVMsZUFBZSxDQUFDLE1BQWM7SUFDbkMsT0FBTyxDQUFDLEtBQXlCLEVBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDO0FBQ3hGLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLE1BQWM7SUFDckMsT0FBTyxDQUFDLEtBQXlCLEVBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRyxDQUFDIn0=