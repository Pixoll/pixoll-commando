"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WelcomeModel = (0, mongoose_1.model)('welcome', new mongoose_1.Schema({
    guild: String,
    channel: String,
    message: String,
}), 'welcome');
exports.default = WelcomeModel;
//# sourceMappingURL=welcome.js.map