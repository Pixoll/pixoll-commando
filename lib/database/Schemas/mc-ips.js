"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const McIpsModel = (0, mongoose_1.model)('mc-ips', new mongoose_1.Schema({
    guild: String,
    type: String,
    ip: String,
    port: Number,
}));
exports.default = McIpsModel;
//# sourceMappingURL=mc-ips.js.map