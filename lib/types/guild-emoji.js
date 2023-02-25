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
    validate(value, msg) {
        const matches = value.match(/^(?:<a?:(\w+):)?(\d+)>?$/);
        if (matches && msg.client.emojis.cache.has(matches[2]))
            return true;
        if (!msg.guild)
            return false;
        const search = value.toLowerCase();
        let emojis = msg.guild.emojis.cache.filter(nameFilterInexact(search));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpbGQtZW1vamkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvZ3VpbGQtZW1vamkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBa0M7QUFDbEMsbURBQTJCO0FBQzNCLDJDQUE0QztBQUs1QyxNQUFxQix1QkFBd0IsU0FBUSxjQUEyQjtJQUM1RSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBYSxFQUFFLEdBQW9CO1FBQy9DLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN4RCxJQUFJLE9BQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRXBFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRTdCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDL0IsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVuQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzNELElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDeEMsSUFBSSxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUM7WUFBRSxNQUFNLEdBQUcsV0FBVyxDQUFDO1FBRS9DLE9BQU8sTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFO1lBQ3BCLENBQUMsQ0FBQyxHQUFHLGNBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUEsMkJBQWMsRUFBQyxLQUFLLENBQUMsSUFBYyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSTtZQUNqRyxDQUFDLENBQUMsaURBQWlELENBQUM7SUFDNUQsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhLEVBQUUsT0FBd0I7UUFDaEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVwQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDeEQsSUFBSSxPQUFPO1lBQUUsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFOUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ25DLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUM5QixJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQztRQUVyRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzNELElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDO1lBQUUsT0FBTyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDO1FBRS9ELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQXpDRCwwQ0F5Q0M7QUFFRCxTQUFTLGVBQWUsQ0FBQyxNQUFjO0lBQ25DLE9BQU8sQ0FBQyxLQUF5QixFQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBQztBQUN4RixDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxNQUFjO0lBQ3JDLE9BQU8sQ0FBQyxLQUF5QixFQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEcsQ0FBQyJ9