"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FaqModel = (0, mongoose_1.model)('faq', new mongoose_1.Schema({
    question: String,
    answer: String,
}), 'faq');
exports.default = FaqModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFxLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RhdGFiYXNlL1NjaGVtYXMvZmFxLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXlDO0FBUXpDLE1BQU0sUUFBUSxHQUFHLElBQUEsZ0JBQUssRUFBMEIsS0FBSyxFQUFFLElBQUksaUJBQU0sQ0FBQztJQUM5RCxRQUFRLEVBQUUsTUFBTTtJQUNoQixNQUFNLEVBQUUsTUFBTTtDQUNqQixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFFWCxrQkFBZSxRQUFRLENBQUMifQ==