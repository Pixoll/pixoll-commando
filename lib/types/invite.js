"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
class InviteArgumentType extends base_1.default {
    /** The fetched invite */
    fetched;
    constructor(client) {
        super(client, 'invite');
        this.fetched = null;
    }
    async validate(val) {
        const invite = await this.client.fetchInvite(val).catch(() => null);
        this.fetched = invite;
        return !!invite;
    }
    async parse(val) {
        if (this.fetched) {
            const { fetched } = this;
            this.fetched = null;
            return fetched;
        }
        return await this.client.fetchInvite(val);
    }
}
exports.default = InviteArgumentType;
//# sourceMappingURL=invite.js.map