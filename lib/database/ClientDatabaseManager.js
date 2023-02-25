"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = __importDefault(require("./DatabaseManager"));
const Schemas_1 = __importDefault(require("./Schemas"));
/** The client's database manager (MongoDB) */
class ClientDatabaseManager {
    disabled;
    errors;
    faq;
    prefixes;
    reminders;
    todo;
    /**
     * @param client - The client this database is for
     */
    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });
        this.disabled = new DatabaseManager_1.default(Schemas_1.default.DisabledModel);
        this.errors = new DatabaseManager_1.default(Schemas_1.default.ErrorsModel);
        this.faq = new DatabaseManager_1.default(Schemas_1.default.FaqModel);
        this.prefixes = new DatabaseManager_1.default(Schemas_1.default.PrefixesModel);
        this.reminders = new DatabaseManager_1.default(Schemas_1.default.RemindersModel);
        this.todo = new DatabaseManager_1.default(Schemas_1.default.TodoModel);
    }
    /**
     * Initializes the caching of this client's data
     * @param data - The data to assign to the client
     */
    init(data) {
        for (const [name, schema] of data) {
            const dbManager = this[name];
            if (!dbManager)
                continue;
            // @ts-expect-error: AnySchema not assignable to individual schema types
            dbManager.cache = schema;
        }
        return this;
    }
}
exports.default = ClientDatabaseManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50RGF0YWJhc2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFiYXNlL0NsaWVudERhdGFiYXNlTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLHdFQUFnRDtBQUNoRCx3REFRbUI7QUFJbkIsOENBQThDO0FBQzlDLE1BQXFCLHFCQUFxQjtJQUcvQixRQUFRLENBQWtDO0lBQzFDLE1BQU0sQ0FBK0I7SUFDckMsR0FBRyxDQUE2QjtJQUNoQyxRQUFRLENBQWdDO0lBQ3hDLFNBQVMsQ0FBa0M7SUFDM0MsSUFBSSxDQUE4QjtJQUV6Qzs7T0FFRztJQUNILFlBQW1CLE1BQXNCO1FBQ3JDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRXpELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHlCQUFlLENBQUMsaUJBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLHlCQUFlLENBQUMsaUJBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7O09BR0c7SUFDTyxJQUFJLENBQUMsSUFBOEQ7UUFDekUsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtZQUMvQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBaUIsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxTQUFTO2dCQUFFLFNBQVM7WUFDekIsd0VBQXdFO1lBQ3hFLFNBQVMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBckNELHdDQXFDQyJ9