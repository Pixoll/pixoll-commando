import { Model, FilterQuery, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';
import ActiveModel, { ActiveSchema } from './active';
import AfkModel, { AfkSchema } from './afk';
import DisabledModel, { DisabledSchema } from './disabled';
import ErrorsModel, { ErrorSchema } from './errors';
import FaqModel, { FaqSchema } from './faq';
import McIpsModel, { McIpSchema } from './mc-ips';
import ModerationsModel, { ModerationSchema } from './moderations';
import ModulesModel, { ModuleSchema } from './modules';
import PollsModel, { PollSchema } from './polls';
import PrefixesModel, { PrefixSchema } from './prefixes';
import ReactionRolesModel, { ReactionRoleSchema } from './reaction-roles';
import RemindersModel, { ReminderSchema } from './reminders';
import RulesModel, { RuleSchema } from './rules';
import SetupModel, { SetupSchema } from './setup';
import StickyRolesModel, { StickyRoleSchema } from './sticky-roles';
import TodoModel, { TodoSchema } from './todo';
import WelcomeModel, { WelcomeSchema } from './welcome';

// @ts-expect-error: incompatible methods between interfaces
export interface SimplifiedModel<T> extends Model<T> {
    find(filter: FilterQuery<T>): Promise<T[]>;
    findOne(filter: FilterQuery<T>): Promise<T>;
    findById(id: string): Promise<T>;
    updateOne(filter: FilterQuery<T>, update: Omit<T, '_id'> | UpdateQuery<Omit<T, '_id'>>): Promise<UpdateWriteOpResult>;
}

export type ModelFrom<T extends BaseSchema = BaseSchema, IncludeId extends boolean = false> = Model<
    DocumentFrom<T, IncludeId>
>;

export type AnySchema = BaseSchema & Partial<
    | ActiveSchema
    | AfkSchema
    | DisabledSchema
    | ErrorSchema
    | FaqSchema
    | McIpSchema
    | ModerationSchema
    | ModuleSchema
    | PollSchema
    | PrefixSchema
    | ReactionRoleSchema
    | ReminderSchema
    | RuleSchema
    | SetupSchema
    | StickyRoleSchema
    | TodoSchema
    | WelcomeSchema
> & { guild?: string };

export {
    BaseSchema,
    ActiveSchema,
    AfkSchema,
    DisabledSchema,
    ErrorSchema,
    FaqSchema,
    McIpSchema,
    ModerationSchema,
    ModuleSchema,
    PollSchema,
    PrefixSchema,
    ReactionRoleSchema,
    ReminderSchema,
    RuleSchema,
    SetupSchema,
    StickyRoleSchema,
    TodoSchema,
    WelcomeSchema,
};

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

const Schemas = {
    ActiveModel,
    AfkModel,
    DisabledModel,
    ErrorsModel,
    FaqModel,
    McIpsModel,
    ModerationsModel,
    ModulesModel,
    PollsModel,
    PrefixesModel,
    ReactionRolesModel,
    RemindersModel,
    RulesModel,
    SetupModel,
    StickyRolesModel,
    TodoModel,
    WelcomeModel,
};

export default Schemas;
