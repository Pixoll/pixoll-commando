"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReactionRolesModel = (0, mongoose_1.model)('reaction-roles', new mongoose_1.Schema({
    guild: String,
    channel: String,
    message: String,
    roles: [String],
    emojis: [String],
}));
exports.default = ReactionRolesModel;
//# sourceMappingURL=reaction-roles.js.map