"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ErrorsModel = (0, mongoose_1.model)('errors', new mongoose_1.Schema({
    _id: String,
    type: String,
    name: String,
    message: String,
    command: String,
    files: String,
}, { timestamps: true }));
exports.default = ErrorsModel;
//# sourceMappingURL=errors.js.map