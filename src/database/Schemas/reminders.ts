import { model, Schema } from 'mongoose';
import { BaseSchemaWithTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface ReminderSchema extends BaseSchemaWithTimestamps {
    user: Snowflake;
    reminder: string;
    remindAt: number;
    message: Snowflake;
    msgURL: string;
    channel: Snowflake;
}

const RemindersModel = model<DocumentFrom<ReminderSchema>>('reminders', new Schema({
    user: String,
    reminder: String,
    remindAt: Number,
    message: String,
    msgURL: String,
    channel: String,
}, { timestamps: true }));

export default RemindersModel;
