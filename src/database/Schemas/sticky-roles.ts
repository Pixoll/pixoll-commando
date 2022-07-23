import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface StickyRoleSchema extends BaseSchema {
    guild: string;
    user: string;
    roles: string[];
}

const StickyRolesModel = model<DocumentFrom<StickyRoleSchema>>('sticky-roles', new Schema({
    guild: String,
    user: String,
    roles: [String],
}));

export default StickyRolesModel;
