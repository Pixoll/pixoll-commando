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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFiYXNlL1NjaGVtYXMvZXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXlDO0FBWXpDLE1BQU0sV0FBVyxHQUFHLElBQUEsZ0JBQUssRUFBa0MsUUFBUSxFQUFFLElBQUksaUJBQU0sQ0FBQztJQUM1RSxHQUFHLEVBQUUsTUFBTTtJQUNYLElBQUksRUFBRSxNQUFNO0lBQ1osSUFBSSxFQUFFLE1BQU07SUFDWixPQUFPLEVBQUUsTUFBTTtJQUNmLE9BQU8sRUFBRSxNQUFNO0lBQ2YsS0FBSyxFQUFFLE1BQU07Q0FDaEIsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFMUIsa0JBQWUsV0FBVyxDQUFDIn0=