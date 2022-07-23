"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AfkModel = (0, mongoose_1.model)('afk', new mongoose_1.Schema({
    guild: String,
    user: String,
    status: String,
}, { timestamps: true }), 'afk');
exports.default = AfkModel;
//# sourceMappingURL=afk.js.map