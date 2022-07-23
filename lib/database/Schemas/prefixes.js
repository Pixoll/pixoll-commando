"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PrefixesModel = (0, mongoose_1.model)('prefixes', new mongoose_1.Schema({
    global: Boolean,
    guild: String,
    prefix: String,
}));
exports.default = PrefixesModel;
//# sourceMappingURL=prefixes.js.map