"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RemindersModel = (0, mongoose_1.model)('reminders', new mongoose_1.Schema({
    user: String,
    reminder: String,
    remindAt: Number,
    message: String,
    msgURL: String,
    channel: String,
}, { timestamps: true }));
exports.default = RemindersModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtaW5kZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFiYXNlL1NjaGVtYXMvcmVtaW5kZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXlDO0FBYXpDLE1BQU0sY0FBYyxHQUFHLElBQUEsZ0JBQUssRUFBK0IsV0FBVyxFQUFFLElBQUksaUJBQU0sQ0FBQztJQUMvRSxJQUFJLEVBQUUsTUFBTTtJQUNaLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsTUFBTSxFQUFFLE1BQU07SUFDZCxPQUFPLEVBQUUsTUFBTTtDQUNsQixFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUxQixrQkFBZSxjQUFjLENBQUMifQ==