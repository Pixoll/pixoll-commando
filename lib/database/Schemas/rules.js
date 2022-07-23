"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RulesModel = (0, mongoose_1.model)('rules', new mongoose_1.Schema({
    guild: String,
    rules: [String],
}));
exports.default = RulesModel;
//# sourceMappingURL=rules.js.map