"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ModulesModel = (0, mongoose_1.model)('modules', new mongoose_1.Schema({
    guild: String,
    // chatFilter: Boolean,
    // scamDetector: Boolean,
    stickyRoles: Boolean,
    welcome: Boolean,
    auditLogs: {
        boosts: Boolean,
        channels: Boolean,
        commands: Boolean,
        emojis: Boolean,
        events: Boolean,
        invites: Boolean,
        members: Boolean,
        messages: Boolean,
        moderation: Boolean,
        modules: Boolean,
        roles: Boolean,
        server: Boolean,
        stickers: Boolean,
        threads: Boolean,
        users: Boolean,
        voice: Boolean,
    },
}));
exports.default = ModulesModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kYXRhYmFzZS9TY2hlbWFzL21vZHVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBeUM7QUFrQ3pDLE1BQU0sWUFBWSxHQUFHLElBQUEsZ0JBQUssRUFBNkIsU0FBUyxFQUFFLElBQUksaUJBQU0sQ0FBQztJQUN6RSxLQUFLLEVBQUUsTUFBTTtJQUNiLHVCQUF1QjtJQUN2Qix5QkFBeUI7SUFDekIsV0FBVyxFQUFFLE9BQU87SUFDcEIsT0FBTyxFQUFFLE9BQU87SUFDaEIsU0FBUyxFQUFFO1FBQ1AsTUFBTSxFQUFFLE9BQU87UUFDZixRQUFRLEVBQUUsT0FBTztRQUNqQixRQUFRLEVBQUUsT0FBTztRQUNqQixNQUFNLEVBQUUsT0FBTztRQUNmLE1BQU0sRUFBRSxPQUFPO1FBQ2YsT0FBTyxFQUFFLE9BQU87UUFDaEIsT0FBTyxFQUFFLE9BQU87UUFDaEIsUUFBUSxFQUFFLE9BQU87UUFDakIsVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLE9BQU87UUFDaEIsS0FBSyxFQUFFLE9BQU87UUFDZCxNQUFNLEVBQUUsT0FBTztRQUNmLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLE9BQU87S0FDakI7Q0FDSixDQUFDLENBQUMsQ0FBQztBQUVKLGtCQUFlLFlBQVksQ0FBQyJ9