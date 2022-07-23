"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ActiveModel = (0, mongoose_1.model)('active', new mongoose_1.Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    role: String,
    duration: Number,
}, { timestamps: true }), 'active');
exports.default = ActiveModel;
//# sourceMappingURL=active.js.map