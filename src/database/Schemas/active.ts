import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';
import { TimeBasedModerationType } from './moderations';

export interface ActiveSchema extends BaseSchema {
    type: TimeBasedModerationType | 'temp-role';
    guild: string;
    userId: string;
    userTag: string;
    role: string;
    duration: number;
}

const ActiveModel = model<DocumentFrom<ActiveSchema, true>>('active', new Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    role: String,
    duration: Number,
}, { timestamps: true }), 'active');

export default ActiveModel;
