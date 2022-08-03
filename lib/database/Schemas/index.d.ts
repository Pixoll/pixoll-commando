import { Model, FilterQuery, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';
import { ActiveSchema } from './active';
import { AfkSchema } from './afk';
import { DisabledSchema } from './disabled';
import { ErrorSchema } from './errors';
import { FaqSchema } from './faq';
import { McIpSchema } from './mc-ips';
import { ModerationSchema } from './moderations';
import { ModuleSchema } from './modules';
import { PollSchema } from './polls';
import { PrefixSchema } from './prefixes';
import { ReactionRoleSchema } from './reaction-roles';
import { ReminderSchema } from './reminders';
import { RuleSchema } from './rules';
import { SetupSchema } from './setup';
import { StickyRoleSchema } from './sticky-roles';
import { TodoSchema } from './todo';
import { WelcomeSchema } from './welcome';
export interface SimplifiedModel<T> extends Model<T> {
    find(filter: FilterQuery<T>): Promise<T[]>;
    findOne(filter: FilterQuery<T>): Promise<T>;
    findById(id: string): Promise<T>;
    updateOne(filter: FilterQuery<T>, update: Omit<T, '_id'> | UpdateQuery<Omit<T, '_id'>>): Promise<UpdateWriteOpResult>;
}
export declare type ModelFrom<T extends BaseSchema = BaseSchema, IncludeId extends boolean = false> = Model<DocumentFrom<T, IncludeId>>;
export declare type AnySchema = BaseSchema & Partial<ActiveSchema | AfkSchema | DisabledSchema | ErrorSchema | FaqSchema | McIpSchema | ModerationSchema | ModuleSchema | PollSchema | PrefixSchema | ReactionRoleSchema | ReminderSchema | RuleSchema | SetupSchema | StickyRoleSchema | TodoSchema | WelcomeSchema> & {
    guild?: string;
};
export { BaseSchema, ActiveSchema, AfkSchema, DisabledSchema, ErrorSchema, FaqSchema, McIpSchema, ModerationSchema, ModuleSchema, PollSchema, PrefixSchema, ReactionRoleSchema, ReminderSchema, RuleSchema, SetupSchema, StickyRoleSchema, TodoSchema, WelcomeSchema, };
export interface SimplifiedSchemas {
    ActiveModel: SimplifiedModel<ActiveSchema>;
    AfkModel: SimplifiedModel<AfkSchema>;
    DisabledModel: SimplifiedModel<DisabledSchema>;
    ErrorsModel: SimplifiedModel<ErrorSchema>;
    FaqModel: SimplifiedModel<FaqSchema>;
    McIpsModel: SimplifiedModel<McIpSchema>;
    ModerationsModel: SimplifiedModel<ModerationSchema>;
    ModulesModel: SimplifiedModel<ModuleSchema>;
    PollsModel: SimplifiedModel<PollSchema>;
    PrefixesModel: SimplifiedModel<PrefixSchema>;
    ReactionRolesModel: SimplifiedModel<ReactionRoleSchema>;
    RemindersModel: SimplifiedModel<ReminderSchema>;
    RulesModel: SimplifiedModel<RuleSchema>;
    SetupModel: SimplifiedModel<SetupSchema>;
    StickyRolesModel: SimplifiedModel<StickyRoleSchema>;
    TodoModel: SimplifiedModel<TodoSchema>;
    WelcomeModel: SimplifiedModel<WelcomeSchema>;
}
declare const Schemas: {
    ActiveModel: Model<DocumentFrom<ActiveSchema, true>, {}, {}, {}, any>;
    AfkModel: Model<DocumentFrom<AfkSchema, false>, {}, {}, {}, any>;
    DisabledModel: Model<DocumentFrom<DisabledSchema, false>, {}, {}, {}, any>;
    ErrorsModel: Model<DocumentFrom<ErrorSchema, true>, {}, {}, {}, any>;
    FaqModel: Model<DocumentFrom<FaqSchema, false>, {}, {}, {}, any>;
    McIpsModel: Model<DocumentFrom<McIpSchema, false>, {}, {}, {}, any>;
    ModerationsModel: Model<DocumentFrom<ModerationSchema, true>, {}, {}, {}, any>;
    ModulesModel: Model<DocumentFrom<ModuleSchema, false>, {}, {}, {}, any>;
    PollsModel: Model<DocumentFrom<PollSchema, false>, {}, {}, {}, any>;
    PrefixesModel: Model<DocumentFrom<PrefixSchema, false>, {}, {}, {}, any>;
    ReactionRolesModel: Model<DocumentFrom<ReactionRoleSchema, false>, {}, {}, {}, any>;
    RemindersModel: Model<DocumentFrom<ReminderSchema, false>, {}, {}, {}, any>;
    RulesModel: Model<DocumentFrom<RuleSchema, false>, {}, {}, {}, any>;
    SetupModel: Model<DocumentFrom<SetupSchema, false>, {}, {}, {}, any>;
    StickyRolesModel: Model<DocumentFrom<StickyRoleSchema, false>, {}, {}, {}, any>;
    TodoModel: Model<DocumentFrom<TodoSchema, false>, {}, {}, {}, any>;
    WelcomeModel: Model<DocumentFrom<WelcomeSchema, false>, {}, {}, {}, any>;
};
export default Schemas;
