import { model, Schema } from 'mongoose';
import { BaseSchemaWithoutTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface WelcomeSchema extends BaseSchemaWithoutTimestamps {
    guild: Snowflake;
    channel: Snowflake;
    message: Snowflake;
}

const WelcomeModel = model<DocumentFrom<WelcomeSchema>>('welcome', new Schema({
    guild: String,
    channel: String,
    message: String,
}), 'welcome');

export default WelcomeModel;
