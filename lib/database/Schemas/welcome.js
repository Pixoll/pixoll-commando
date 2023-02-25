"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WelcomeModel = (0, mongoose_1.model)('welcome', new mongoose_1.Schema({
    guild: String,
    channel: String,
    message: String,
}), 'welcome');
exports.default = WelcomeModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VsY29tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kYXRhYmFzZS9TY2hlbWFzL3dlbGNvbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBeUM7QUFVekMsTUFBTSxZQUFZLEdBQUcsSUFBQSxnQkFBSyxFQUE4QixTQUFTLEVBQUUsSUFBSSxpQkFBTSxDQUFDO0lBQzFFLEtBQUssRUFBRSxNQUFNO0lBQ2IsT0FBTyxFQUFFLE1BQU07SUFDZixPQUFPLEVBQUUsTUFBTTtDQUNsQixDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFFZixrQkFBZSxZQUFZLENBQUMifQ==