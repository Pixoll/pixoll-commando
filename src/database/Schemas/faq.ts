import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface FaqSchema extends BaseSchema {
    question: string;
    answer: string;
}

const FaqModel = model<DocumentFrom<FaqSchema>>('faq', new Schema({
    question: String,
    answer: String,
}), 'faq');

export default FaqModel;
