"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ModerationsModel = (0, mongoose_1.model)('moderations', new mongoose_1.Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    modId: String,
    modTag: String,
    reason: String,
    duration: String,
}, { timestamps: true }));
exports.default = ModerationsModel;
//# sourceMappingURL=moderations.js.map