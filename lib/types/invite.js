"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
class InviteArgumentType extends base_1.default {
    /** The fetched invite */
    fetchedInvite;
    constructor(client) {
        super(client, 'invite');
        this.fetchedInvite = null;
    }
    async validate(value) {
        const invite = await this.client.fetchInvite(value).catch(() => null);
        this.fetchedInvite = invite;
        return !!invite;
    }
    async parse(value) {
        const { fetchedInvite } = this;
        if (fetchedInvite) {
            this.fetchedInvite = null;
            return fetchedInvite;
        }
        return await this.client.fetchInvite(value);
    }
}
exports.default = InviteArgumentType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL2ludml0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLGtEQUFrQztBQUVsQyxNQUFxQixrQkFBbUIsU0FBUSxjQUFzQjtJQUNsRSx5QkFBeUI7SUFDZixhQUFhLENBQXdCO0lBRS9DLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBYTtRQUMvQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztRQUM1QixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDcEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBYTtRQUM1QixNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksYUFBYSxFQUFFO1lBQ2YsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsT0FBTyxhQUFhLENBQUM7U0FDeEI7UUFDRCxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNKO0FBeEJELHFDQXdCQyJ9