import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface ReminderSchema extends BaseSchema {
    user: string;
    reminder: string;
    remindAt: number;
    message: string;
    msgURL: string;
    channel: string;
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
