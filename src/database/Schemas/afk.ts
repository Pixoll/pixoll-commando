import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface AfkSchema extends BaseSchema {
    guild: string;
    user: string;
    status: string;
}

const AfkModel = model<DocumentFrom<AfkSchema>>('afk', new Schema({
    guild: String,
    user: String,
    status: String,
}, { timestamps: true }), 'afk');

export default AfkModel;
