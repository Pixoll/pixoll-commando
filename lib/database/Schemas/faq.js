"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FaqModel = (0, mongoose_1.model)('faq', new mongoose_1.Schema({
    question: String,
    answer: String,
}), 'faq');
exports.default = FaqModel;
//# sourceMappingURL=faq.js.map