"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DisabledModel = (0, mongoose_1.model)('disabled', new mongoose_1.Schema({
    guild: String,
    global: Boolean,
    commands: [String],
    groups: [String],
}), 'disabled');
exports.default = DisabledModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzYWJsZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGF0YWJhc2UvU2NoZW1hcy9kaXNhYmxlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF5QztBQVd6QyxNQUFNLGFBQWEsR0FBRyxJQUFBLGdCQUFLLEVBQStCLFVBQVUsRUFBRSxJQUFJLGlCQUFNLENBQUM7SUFDN0UsS0FBSyxFQUFFLE1BQU07SUFDYixNQUFNLEVBQUUsT0FBTztJQUNmLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNsQixNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUM7Q0FDbkIsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRWhCLGtCQUFlLGFBQWEsQ0FBQyJ9