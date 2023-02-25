"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const util_1 = __importDefault(require("../util"));
const discord_js_1 = require("discord.js");
class GroupArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'group');
    }
    validate(value) {
        const groups = this.client.registry.findGroups(value);
        if (groups.length === 1)
            return true;
        if (groups.length === 0)
            return false;
        return groups.length <= 15
            ? `${util_1.default.disambiguation(groups.map(grp => (0, discord_js_1.escapeMarkdown)(grp.name)), 'groups')}\n`
            : 'Multiple groups found. Please be more specific.';
    }
    parse(value) {
        return this.client.registry.findGroups(value)[0];
    }
}
exports.default = GroupArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBa0M7QUFDbEMsbURBQTJCO0FBQzNCLDJDQUE0QztBQUk1QyxNQUFxQixpQkFBa0IsU0FBUSxjQUFxQjtJQUNoRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBYTtRQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNyQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3RDLE9BQU8sTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFO1lBQ3RCLENBQUMsQ0FBQyxHQUFHLGNBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUEsMkJBQWMsRUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSTtZQUNuRixDQUFDLENBQUMsaURBQWlELENBQUM7SUFDNUQsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7Q0FDSjtBQWpCRCxvQ0FpQkMifQ==