import { model, Schema } from 'mongoose';
import { BaseSchemaWithoutTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface DisabledSchema extends BaseSchemaWithoutTimestamps {
    guild?: Snowflake | undefined;
    global: boolean;
    commands: string[];
    groups: string[];
}

const DisabledModel = model<DocumentFrom<DisabledSchema>>('disabled', new Schema({
    guild: String,
    global: Boolean,
    commands: [String],
    groups: [String],
}), 'disabled');

export default DisabledModel;
