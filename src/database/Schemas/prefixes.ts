import { model, Schema } from 'mongoose';
import { BaseSchemaWithoutTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface PrefixSchema extends BaseSchemaWithoutTimestamps {
    global: boolean;
    guild?: Snowflake | undefined;
    prefix: string;
}

const PrefixesModel = model<DocumentFrom<PrefixSchema>>('prefixes', new Schema({
    global: Boolean,
    guild: String,
    prefix: String,
}));

export default PrefixesModel;
