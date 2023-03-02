import { Model } from 'mongoose';
import { BaseSchema, DocumentFrom, BaseSchemaWithTimestamps } from './base';
import { ActiveSchema } from './active';
import { AfkSchema } from './afk';
import { DisabledSchema } from './disabled';
import { ErrorSchema } from './errors';
import { FaqSchema } from './faq';
import { McIpSchema } from './mc-ips';
import { ModerationSchema, ModerationType, TimeBasedModerationType } from './moderations';
import { GuildAuditLog, GuildModule, ModuleSchema } from './modules';
import { PollSchema } from './polls';
import { PrefixSchema } from './prefixes';
import { ReactionRoleSchema } from './reaction-roles';
import { ReminderSchema } from './reminders';
import { RuleSchema } from './rules';
import { SetupSchema } from './setup';
import { StickyRoleSchema } from './sticky-roles';
import { TodoSchema } from './todo';
import { WelcomeSchema } from './welcome';
export { BaseSchemaWithTimestamps, DocumentFrom, GuildAuditLog, GuildModule, ModerationType, TimeBasedModerationType, };
export type ModelFrom<T extends BaseSchema | (Omit<BaseSchema, '_id'> & {
    readonly _id: string;
}) = BaseSchema, IncludeId extends boolean = boolean> = Model<DocumentFrom<T, IncludeId>>;
export type AnySchema<IncludeId extends boolean = boolean> = Partial<ActiveSchema | AfkSchema | DisabledSchema | ErrorSchema | FaqSchema | McIpSchema | ModerationSchema | ModuleSchema | PollSchema | PrefixSchema | ReactionRoleSchema | ReminderSchema | RuleSchema | SetupSchema | StickyRoleSchema | TodoSchema | WelcomeSchema> & (IncludeId extends true ? (Omit<BaseSchema, '_id'> & {
    readonly _id: string;
}) : BaseSchema) & {
    guild?: string;
};
export { BaseSchema, ActiveSchema, AfkSchema, DisabledSchema, ErrorSchema, FaqSchema, McIpSchema, ModerationSchema, ModuleSchema, PollSchema, PrefixSchema, ReactionRoleSchema, ReminderSchema, RuleSchema, SetupSchema, StickyRoleSchema, TodoSchema, WelcomeSchema, };
declare const Schemas: {
    readonly ActiveModel: Model<DocumentFrom<ActiveSchema, true>, {}, {}, {}, any>;
    readonly AfkModel: Model<DocumentFrom<AfkSchema, false>, {}, {}, {}, any>;
    readonly DisabledModel: Model<DocumentFrom<DisabledSchema, false>, {}, {}, {}, any>;
    readonly ErrorsModel: Model<DocumentFrom<ErrorSchema, true>, {}, {}, {}, any>;
    readonly FaqModel: Model<DocumentFrom<FaqSchema, false>, {}, {}, {}, any>;
    readonly McIpsModel: Model<DocumentFrom<McIpSchema, false>, {}, {}, {}, any>;
    readonly ModerationsModel: Model<DocumentFrom<ModerationSchema, true>, {}, {}, {}, any>;
    readonly ModulesModel: Model<DocumentFrom<ModuleSchema, false>, {}, {}, {}, any>;
    readonly PollsModel: Model<DocumentFrom<PollSchema, false>, {}, {}, {}, any>;
    readonly PrefixesModel: Model<DocumentFrom<PrefixSchema, false>, {}, {}, {}, any>;
    readonly ReactionRolesModel: Model<DocumentFrom<ReactionRoleSchema, false>, {}, {}, {}, any>;
    readonly RemindersModel: Model<DocumentFrom<ReminderSchema, false>, {}, {}, {}, any>;
    readonly RulesModel: Model<DocumentFrom<RuleSchema, false>, {}, {}, {}, any>;
    readonly SetupModel: Model<DocumentFrom<SetupSchema, false>, {}, {}, {}, any>;
    readonly StickyRolesModel: Model<DocumentFrom<StickyRoleSchema, false>, {}, {}, {}, any>;
    readonly TodoModel: Model<DocumentFrom<TodoSchema, false>, {}, {}, {}, any>;
    readonly WelcomeModel: Model<DocumentFrom<WelcomeSchema, false>, {}, {}, {}, any>;
};
export default Schemas;
