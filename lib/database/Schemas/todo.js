"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TodoModel = (0, mongoose_1.model)('todo', new mongoose_1.Schema({
    user: String,
    list: [String],
}), 'todo');
exports.default = TodoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kYXRhYmFzZS9TY2hlbWFzL3RvZG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBeUM7QUFTekMsTUFBTSxTQUFTLEdBQUcsSUFBQSxnQkFBSyxFQUEyQixNQUFNLEVBQUUsSUFBSSxpQkFBTSxDQUFDO0lBQ2pFLElBQUksRUFBRSxNQUFNO0lBQ1osSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDO0NBQ2pCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUVaLGtCQUFlLFNBQVMsQ0FBQyJ9