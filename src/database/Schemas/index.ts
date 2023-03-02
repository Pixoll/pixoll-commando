import { Model } from 'mongoose';
import { BaseSchema, DocumentFrom, BaseSchemaWithTimestamps } from './base';
import ActiveModel, { ActiveSchema } from './active';
import AfkModel, { AfkSchema } from './afk';
import DisabledModel, { DisabledSchema } from './disabled';
import ErrorsModel, { ErrorSchema } from './errors';
import FaqModel, { FaqSchema } from './faq';
import McIpsModel, { McIpSchema } from './mc-ips';
import ModerationsModel, { ModerationSchema, ModerationType, TimeBasedModerationType } from './moderations';
import ModulesModel, { GuildAuditLog, GuildModule, ModuleSchema } from './modules';
import PollsModel, { PollSchema } from './polls';
import PrefixesModel, { PrefixSchema } from './prefixes';
import ReactionRolesModel, { ReactionRoleSchema } from './reaction-roles';
import RemindersModel, { ReminderSchema } from './reminders';
import RulesModel, { RuleSchema } from './rules';
import SetupModel, { SetupSchema } from './setup';
import StickyRolesModel, { StickyRoleSchema } from './sticky-roles';
import TodoModel, { TodoSchema } from './todo';
import WelcomeModel, { WelcomeSchema } from './welcome';

export {
    BaseSchemaWithTimestamps,
    DocumentFrom,
    GuildAuditLog,
    GuildModule,
    ModerationType,
    TimeBasedModerationType,
};

export type ModelFrom<
    T extends BaseSchema | (Omit<BaseSchema, '_id'> & { readonly _id: string }) = BaseSchema,
    IncludeId extends boolean = boolean
> = Model<
    DocumentFrom<T, IncludeId>
>;

export type AnySchema<IncludeId extends boolean = boolean> = Partial<
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
>
    & (IncludeId extends true ? (Omit<BaseSchema, '_id'> & { readonly _id: string }) : BaseSchema)
    & { guild?: string };

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
} as const;

export default Schemas;
