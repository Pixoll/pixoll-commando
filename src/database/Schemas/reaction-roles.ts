import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface ReactionRoleSchema extends BaseSchema {
    guild: string;
    channel: string;
    message: string;
    roles: string[];
    emojis: string[];
}

const ReactionRolesModel = model<DocumentFrom<ReactionRoleSchema>>('reaction-roles', new Schema({
    guild: String,
    channel: String,
    message: String,
    roles: [String],
    emojis: [String],
}));

export default ReactionRolesModel;
