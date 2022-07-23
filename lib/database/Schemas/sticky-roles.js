"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StickyRolesModel = (0, mongoose_1.model)('sticky-roles', new mongoose_1.Schema({
    guild: String,
    user: String,
    roles: [String],
}));
exports.default = StickyRolesModel;
//# sourceMappingURL=sticky-roles.js.map