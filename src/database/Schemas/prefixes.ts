import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface PrefixSchema extends BaseSchema {
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
