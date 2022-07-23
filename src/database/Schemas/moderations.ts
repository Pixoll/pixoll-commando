import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export type TimeBasedModerationType = 'mute' | 'temp-ban' | 'time-out';

export interface ModerationSchema extends BaseSchema {
    type: TimeBasedModerationType | 'ban' | 'kick' | 'soft-ban' | 'warn';
    guild: string;
    userId: string;
    userTag: string;
    modId: string;
    modTag: string;
    reason: string;
    duration: string;
}

const ModerationsModel = model<DocumentFrom<ModerationSchema, true>>('moderations', new Schema({
    _id: String,
    type: String,
    guild: String,
    userId: String,
    userTag: String,
    modId: String,
    modTag: String,
    reason: String,
    duration: String,
}, { timestamps: true }));

export default ModerationsModel;
