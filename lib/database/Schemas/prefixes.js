"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PrefixesModel = (0, mongoose_1.model)('prefixes', new mongoose_1.Schema({
    global: Boolean,
    guild: String,
    prefix: String,
}));
exports.default = PrefixesModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGF0YWJhc2UvU2NoZW1hcy9wcmVmaXhlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF5QztBQVV6QyxNQUFNLGFBQWEsR0FBRyxJQUFBLGdCQUFLLEVBQTZCLFVBQVUsRUFBRSxJQUFJLGlCQUFNLENBQUM7SUFDM0UsTUFBTSxFQUFFLE9BQU87SUFDZixLQUFLLEVBQUUsTUFBTTtJQUNiLE1BQU0sRUFBRSxNQUFNO0NBQ2pCLENBQUMsQ0FBQyxDQUFDO0FBRUosa0JBQWUsYUFBYSxDQUFDIn0=