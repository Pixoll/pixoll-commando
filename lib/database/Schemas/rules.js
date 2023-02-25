"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RulesModel = (0, mongoose_1.model)('rules', new mongoose_1.Schema({
    guild: String,
    rules: [String],
}));
exports.default = RulesModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGF0YWJhc2UvU2NoZW1hcy9ydWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF5QztBQVN6QyxNQUFNLFVBQVUsR0FBRyxJQUFBLGdCQUFLLEVBQTJCLE9BQU8sRUFBRSxJQUFJLGlCQUFNLENBQUM7SUFDbkUsS0FBSyxFQUFFLE1BQU07SUFDYixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7Q0FDbEIsQ0FBQyxDQUFDLENBQUM7QUFFSixrQkFBZSxVQUFVLENBQUMifQ==