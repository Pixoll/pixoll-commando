import { model, Schema } from 'mongoose';
import { BaseSchemaWithoutTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface StickyRoleSchema extends BaseSchemaWithoutTimestamps {
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
