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
    validate(val) {
        const groups = this.client.registry.findGroups(val);
        if (groups.length === 1)
            return true;
        if (groups.length === 0)
            return false;
        return groups.length <= 15 ?
            `${util_1.default.disambiguation(groups.map(grp => discord_js_1.Util.escapeMarkdown(grp.name)), 'groups')}\n` :
            'Multiple groups found. Please be more specific.';
    }
    parse(val) {
        return this.client.registry.findGroups(val)[0];
    }
}
exports.default = GroupArgumentType;
//# sourceMappingURL=group.js.map