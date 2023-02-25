"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReactionRolesModel = (0, mongoose_1.model)('reaction-roles', new mongoose_1.Schema({
    guild: String,
    channel: String,
    message: String,
    roles: [String],
    emojis: [String],
}));
exports.default = ReactionRolesModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3Rpb24tcm9sZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGF0YWJhc2UvU2NoZW1hcy9yZWFjdGlvbi1yb2xlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF5QztBQVl6QyxNQUFNLGtCQUFrQixHQUFHLElBQUEsZ0JBQUssRUFBbUMsZ0JBQWdCLEVBQUUsSUFBSSxpQkFBTSxDQUFDO0lBQzVGLEtBQUssRUFBRSxNQUFNO0lBQ2IsT0FBTyxFQUFFLE1BQU07SUFDZixPQUFPLEVBQUUsTUFBTTtJQUNmLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNmLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztDQUNuQixDQUFDLENBQUMsQ0FBQztBQUVKLGtCQUFlLGtCQUFrQixDQUFDIn0=