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
//# sourceMappingURL=index.js.map