"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SetupModel = (0, mongoose_1.model)('setup', new mongoose_1.Schema({
    guild: String,
    logsChannel: String,
    memberRole: String,
    botRole: String,
    mutedRole: String,
    lockChannels: [String],
}), 'setup');
exports.default = SetupModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGF0YWJhc2UvU2NoZW1hcy9zZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF5QztBQWF6QyxNQUFNLFVBQVUsR0FBRyxJQUFBLGdCQUFLLEVBQTRCLE9BQU8sRUFBRSxJQUFJLGlCQUFNLENBQUM7SUFDcEUsS0FBSyxFQUFFLE1BQU07SUFDYixXQUFXLEVBQUUsTUFBTTtJQUNuQixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsTUFBTTtJQUNmLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFlBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQztDQUN6QixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFYixrQkFBZSxVQUFVLENBQUMifQ==