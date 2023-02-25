"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ActiveModel = (0, mongoose_1.model)('active', new mongoose_1.Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    role: String,
    duration: Number,
}, { timestamps: true }), 'active');
exports.default = ActiveModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFiYXNlL1NjaGVtYXMvYWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXlDO0FBZXpDLE1BQU0sV0FBVyxHQUFHLElBQUEsZ0JBQUssRUFBbUMsUUFBUSxFQUFFLElBQUksaUJBQU0sQ0FBQztJQUM3RSxHQUFHLEVBQUUsTUFBTTtJQUNYLElBQUksRUFBRSxNQUFNO0lBQ1osS0FBSyxFQUFFLE1BQU07SUFDYixNQUFNLEVBQUUsTUFBTTtJQUNkLE9BQU8sRUFBRSxNQUFNO0lBQ2YsSUFBSSxFQUFFLE1BQU07SUFDWixRQUFRLEVBQUUsTUFBTTtDQUNuQixFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFFcEMsa0JBQWUsV0FBVyxDQUFDIn0=