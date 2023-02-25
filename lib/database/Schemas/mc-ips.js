"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const McIpsModel = (0, mongoose_1.model)('mc-ips', new mongoose_1.Schema({
    guild: String,
    type: String,
    ip: String,
    port: Number,
}));
exports.default = McIpsModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWMtaXBzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFiYXNlL1NjaGVtYXMvbWMtaXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXlDO0FBV3pDLE1BQU0sVUFBVSxHQUFHLElBQUEsZ0JBQUssRUFBMkIsUUFBUSxFQUFFLElBQUksaUJBQU0sQ0FBQztJQUNwRSxLQUFLLEVBQUUsTUFBTTtJQUNiLElBQUksRUFBRSxNQUFNO0lBQ1osRUFBRSxFQUFFLE1BQU07SUFDVixJQUFJLEVBQUUsTUFBTTtDQUNmLENBQUMsQ0FBQyxDQUFDO0FBRUosa0JBQWUsVUFBVSxDQUFDIn0=