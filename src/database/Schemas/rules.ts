import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface RuleSchema extends BaseSchema {
    guild: Snowflake;
    rules: string[];
}

const RulesModel = model<DocumentFrom<RuleSchema>>('rules', new Schema({
    guild: String,
    rules: [String],
}));

export default RulesModel;
