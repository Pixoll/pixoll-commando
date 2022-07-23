"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RemindersModel = (0, mongoose_1.model)('reminders', new mongoose_1.Schema({
    user: String,
    reminder: String,
    remindAt: Number,
    message: String,
    msgURL: String,
    channel: String,
}, { timestamps: true }));
exports.default = RemindersModel;
//# sourceMappingURL=reminders.js.map