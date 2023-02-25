"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const active_1 = __importDefault(require("./active"));
const afk_1 = __importDefault(require("./afk"));
const disabled_1 = __importDefault(require("./disabled"));
const errors_1 = __importDefault(require("./errors"));
const faq_1 = __importDefault(require("./faq"));
const mc_ips_1 = __importDefault(require("./mc-ips"));
const moderations_1 = __importDefault(require("./moderations"));
const modules_1 = __importDefault(require("./modules"));
const polls_1 = __importDefault(require("./polls"));
const prefixes_1 = __importDefault(require("./prefixes"));
const reaction_roles_1 = __importDefault(require("./reaction-roles"));
const reminders_1 = __importDefault(require("./reminders"));
const rules_1 = __importDefault(require("./rules"));
const setup_1 = __importDefault(require("./setup"));
const sticky_roles_1 = __importDefault(require("./sticky-roles"));
const todo_1 = __importDefault(require("./todo"));
const welcome_1 = __importDefault(require("./welcome"));
const Schemas = {
    ActiveModel: active_1.default,
    AfkModel: afk_1.default,
    DisabledModel: disabled_1.default,
    ErrorsModel: errors_1.default,
    FaqModel: faq_1.default,
    McIpsModel: mc_ips_1.default,
    ModerationsModel: moderations_1.default,
    ModulesModel: modules_1.default,
    PollsModel: polls_1.default,
    PrefixesModel: prefixes_1.default,
    ReactionRolesModel: reaction_roles_1.default,
    RemindersModel: reminders_1.default,
    RulesModel: rules_1.default,
    SetupModel: setup_1.default,
    StickyRolesModel: sticky_roles_1.default,
    TodoModel: todo_1.default,
    WelcomeModel: welcome_1.default,
};
exports.default = Schemas;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGF0YWJhc2UvU2NoZW1hcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLHNEQUFxRDtBQUNyRCxnREFBNEM7QUFDNUMsMERBQTJEO0FBQzNELHNEQUFvRDtBQUNwRCxnREFBNEM7QUFDNUMsc0RBQWtEO0FBQ2xELGdFQUE0RztBQUM1Ryx3REFBbUY7QUFDbkYsb0RBQWlEO0FBQ2pELDBEQUF5RDtBQUN6RCxzRUFBMEU7QUFDMUUsNERBQTZEO0FBQzdELG9EQUFpRDtBQUNqRCxvREFBa0Q7QUFDbEQsa0VBQW9FO0FBQ3BFLGtEQUErQztBQUMvQyx3REFBd0Q7QUF5RnhELE1BQU0sT0FBTyxHQUFHO0lBQ1osV0FBVyxFQUFYLGdCQUFXO0lBQ1gsUUFBUSxFQUFSLGFBQVE7SUFDUixhQUFhLEVBQWIsa0JBQWE7SUFDYixXQUFXLEVBQVgsZ0JBQVc7SUFDWCxRQUFRLEVBQVIsYUFBUTtJQUNSLFVBQVUsRUFBVixnQkFBVTtJQUNWLGdCQUFnQixFQUFoQixxQkFBZ0I7SUFDaEIsWUFBWSxFQUFaLGlCQUFZO0lBQ1osVUFBVSxFQUFWLGVBQVU7SUFDVixhQUFhLEVBQWIsa0JBQWE7SUFDYixrQkFBa0IsRUFBbEIsd0JBQWtCO0lBQ2xCLGNBQWMsRUFBZCxtQkFBYztJQUNkLFVBQVUsRUFBVixlQUFVO0lBQ1YsVUFBVSxFQUFWLGVBQVU7SUFDVixnQkFBZ0IsRUFBaEIsc0JBQWdCO0lBQ2hCLFNBQVMsRUFBVCxjQUFTO0lBQ1QsWUFBWSxFQUFaLGlCQUFZO0NBQ2YsQ0FBQztBQUVGLGtCQUFlLE9BQU8sQ0FBQyJ9