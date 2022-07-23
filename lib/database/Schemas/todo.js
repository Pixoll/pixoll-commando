"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TodoModel = (0, mongoose_1.model)('todo', new mongoose_1.Schema({
    user: String,
    list: [String],
}), 'todo');
exports.default = TodoModel;
//# sourceMappingURL=todo.js.map