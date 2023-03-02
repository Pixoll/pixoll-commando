import { model, Schema } from 'mongoose';
import { BaseSchemaWithoutTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface ReactionRoleSchema extends BaseSchemaWithoutTimestamps {
    guild: Snowflake;
    channel: Snowflake;
    message: Snowflake;
    roles: Snowflake[];
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
