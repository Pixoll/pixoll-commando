import { model, Schema } from 'mongoose';
import { BaseSchemaWithTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface AfkSchema extends BaseSchemaWithTimestamps {
    guild: Snowflake;
    user: Snowflake;
    status: string;
}

const AfkModel = model<DocumentFrom<AfkSchema>>('afk', new Schema({
    guild: String,
    user: String,
    status: String,
}, { timestamps: true }), 'afk');

export default AfkModel;
