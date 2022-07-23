"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SetupModel = (0, mongoose_1.model)('setup', new mongoose_1.Schema({
    guild: String,
    logsChannel: String,
    memberRole: String,
    botRole: String,
    mutedRole: String,
    lockChannels: [String],
}), 'setup');
exports.default = SetupModel;
//# sourceMappingURL=setup.js.map