import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface PollSchema extends BaseSchema {
    guild: Snowflake;
    channel: Snowflake;
    message: Snowflake;
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
