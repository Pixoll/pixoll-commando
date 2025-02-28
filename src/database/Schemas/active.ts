import { model, Schema } from 'mongoose';
import { BaseSchemaWithTimestamps, DocumentFrom } from './base';
import { TimeBasedModerationType } from './moderations';
import { Snowflake } from 'discord.js';

export interface ActiveSchema extends Omit<BaseSchemaWithTimestamps, '_id'> {
    readonly _id: string;
    type: TimeBasedModerationType | 'temp-role';
    guild: Snowflake;
    userId: Snowflake;
    userTag: string;
    role?: Snowflake | undefined;
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
