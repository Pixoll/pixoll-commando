"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DisabledModel = (0, mongoose_1.model)('disabled', new mongoose_1.Schema({
    guild: String,
    global: Boolean,
    commands: [String],
    groups: [String],
}), 'disabled');
exports.default = DisabledModel;
//# sourceMappingURL=disabled.js.map