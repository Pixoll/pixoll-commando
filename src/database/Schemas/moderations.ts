import { model, Schema } from 'mongoose';
import { BaseSchemaWithTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export type TimeBasedModerationType =
    | 'mute'
    | 'temp-ban'
    | 'time-out';

export type ModerationType =
    | TimeBasedModerationType
    | 'ban'
    | 'kick'
    | 'soft-ban'
    | 'warn';

export interface ModerationSchema extends Omit<BaseSchemaWithTimestamps, '_id'> {
    readonly _id: string;
    type: ModerationType;
    guild: Snowflake;
    userId: Snowflake;
    userTag: string;
    modId: Snowflake;
    modTag: string;
    reason: string;
    duration?: string | undefined;
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
