import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface McIpSchema extends BaseSchema {
    guild: Snowflake;
    type: 'bedrock' | 'java';
    ip: string;
    port: number;
}

const McIpsModel = model<DocumentFrom<McIpSchema>>('mc-ips', new Schema({
    guild: String,
    type: String,
    ip: String,
    port: Number,
}));

export default McIpsModel;
