"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ModulesModel = (0, mongoose_1.model)('modules', new mongoose_1.Schema({
    guild: String,
    // chatFilter: Boolean,
    // scamDetector: Boolean,
    stickyRoles: Boolean,
    welcome: Boolean,
    auditLogs: {
        boosts: Boolean,
        channels: Boolean,
        commands: Boolean,
        emojis: Boolean,
        events: Boolean,
        invites: Boolean,
        members: Boolean,
        messages: Boolean,
        moderation: Boolean,
        modules: Boolean,
        roles: Boolean,
        server: Boolean,
        stickers: Boolean,
        threads: Boolean,
        users: Boolean,
        voice: Boolean,
    },
}));
exports.default = ModulesModel;
//# sourceMappingURL=modules.js.map