import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface DisabledSchema extends BaseSchema {
    guild?: string;
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
