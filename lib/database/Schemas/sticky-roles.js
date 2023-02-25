"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StickyRolesModel = (0, mongoose_1.model)('sticky-roles', new mongoose_1.Schema({
    guild: String,
    user: String,
    roles: [String],
}));
exports.default = StickyRolesModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5LXJvbGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFiYXNlL1NjaGVtYXMvc3RpY2t5LXJvbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXlDO0FBVXpDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxnQkFBSyxFQUFpQyxjQUFjLEVBQUUsSUFBSSxpQkFBTSxDQUFDO0lBQ3RGLEtBQUssRUFBRSxNQUFNO0lBQ2IsSUFBSSxFQUFFLE1BQU07SUFDWixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7Q0FDbEIsQ0FBQyxDQUFDLENBQUM7QUFFSixrQkFBZSxnQkFBZ0IsQ0FBQyJ9