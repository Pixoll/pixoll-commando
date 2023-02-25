"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PollsModel = (0, mongoose_1.model)('polls', new mongoose_1.Schema({
    guild: String,
    channel: String,
    message: String,
    emojis: [String],
    duration: Number,
}));
exports.default = PollsModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGF0YWJhc2UvU2NoZW1hcy9wb2xscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF5QztBQVl6QyxNQUFNLFVBQVUsR0FBRyxJQUFBLGdCQUFLLEVBQTJCLE9BQU8sRUFBRSxJQUFJLGlCQUFNLENBQUM7SUFDbkUsS0FBSyxFQUFFLE1BQU07SUFDYixPQUFPLEVBQUUsTUFBTTtJQUNmLE9BQU8sRUFBRSxNQUFNO0lBQ2YsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO0lBQ2hCLFFBQVEsRUFBRSxNQUFNO0NBQ25CLENBQUMsQ0FBQyxDQUFDO0FBRUosa0JBQWUsVUFBVSxDQUFDIn0=