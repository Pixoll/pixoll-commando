"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ModerationsModel = (0, mongoose_1.model)('moderations', new mongoose_1.Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    modId: String,
    modTag: String,
    reason: String,
    duration: String,
}, { timestamps: true }));
exports.default = ModerationsModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGF0YWJhc2UvU2NoZW1hcy9tb2RlcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF5QztBQTRCekMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLGdCQUFLLEVBQXVDLGFBQWEsRUFBRSxJQUFJLGlCQUFNLENBQUM7SUFDM0YsR0FBRyxFQUFFLE1BQU07SUFDWCxJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxNQUFNO0lBQ2IsTUFBTSxFQUFFLE1BQU07SUFDZCxPQUFPLEVBQUUsTUFBTTtJQUNmLEtBQUssRUFBRSxNQUFNO0lBQ2IsTUFBTSxFQUFFLE1BQU07SUFDZCxNQUFNLEVBQUUsTUFBTTtJQUNkLFFBQVEsRUFBRSxNQUFNO0NBQ25CLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFCLGtCQUFlLGdCQUFnQixDQUFDIn0=