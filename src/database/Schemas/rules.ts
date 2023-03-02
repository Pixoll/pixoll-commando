import { model, Schema } from 'mongoose';
import { BaseSchemaWithoutTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface RuleSchema extends BaseSchemaWithoutTimestamps {
    guild: Snowflake;
    rules: string[];
}

const RulesModel = model<DocumentFrom<RuleSchema>>('rules', new Schema({
    guild: String,
    rules: [String],
}));

export default RulesModel;
