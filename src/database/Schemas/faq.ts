import { model, Schema } from 'mongoose';
import { BaseSchemaWithoutTimestamps, DocumentFrom } from './base';

export interface FaqSchema extends BaseSchemaWithoutTimestamps {
    question: string;
    answer: string;
}

const FaqModel = model<DocumentFrom<FaqSchema>>('faq', new Schema({
    question: String,
    answer: String,
}), 'faq');

export default FaqModel;
