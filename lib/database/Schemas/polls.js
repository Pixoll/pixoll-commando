"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PollsModel = (0, mongoose_1.model)('polls', new mongoose_1.Schema({
    guild: String,
    channel: String,
    message: String,
    emojis: [String],
    duration: Number,
}));
exports.default = PollsModel;
//# sourceMappingURL=polls.js.map