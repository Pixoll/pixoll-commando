import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface PollSchema extends BaseSchema {
    guild: string;
    channel: string;
    message: string;
    emojis: string[];
    duration: number;
}

const PollsModel = model<DocumentFrom<PollSchema>>('polls', new Schema({
    guild: String,
    channel: String,
    message: String,
    emojis: [String],
    duration: Number,
}));

export default PollsModel;
