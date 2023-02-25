import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface StickyRoleSchema extends BaseSchema {
    guild: Snowflake;
    user: Snowflake;
    roles: Snowflake[];
}

const StickyRolesModel = model<DocumentFrom<StickyRoleSchema>>('sticky-roles', new Schema({
    guild: String,
    user: String,
    roles: [String],
}));

export default StickyRolesModel;
