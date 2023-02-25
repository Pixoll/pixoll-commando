"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AfkModel = (0, mongoose_1.model)('afk', new mongoose_1.Schema({
    guild: String,
    user: String,
    status: String,
}, { timestamps: true }), 'afk');
exports.default = AfkModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWZrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFiYXNlL1NjaGVtYXMvYWZrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXlDO0FBVXpDLE1BQU0sUUFBUSxHQUFHLElBQUEsZ0JBQUssRUFBMEIsS0FBSyxFQUFFLElBQUksaUJBQU0sQ0FBQztJQUM5RCxLQUFLLEVBQUUsTUFBTTtJQUNiLElBQUksRUFBRSxNQUFNO0lBQ1osTUFBTSxFQUFFLE1BQU07Q0FDakIsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBRWpDLGtCQUFlLFFBQVEsQ0FBQyJ9