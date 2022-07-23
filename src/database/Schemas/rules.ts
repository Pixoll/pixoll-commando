import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface RuleSchema extends BaseSchema {
    guild: string;
    rules: string[];
}

const RulesModel = model<DocumentFrom<RuleSchema>>('rules', new Schema({
    guild: String,
    rules: [String],
}));

export default RulesModel;
