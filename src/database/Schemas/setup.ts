import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface SetupSchema extends BaseSchema {
    guild: string;
    logsChannel: string;
    memberRole: string;
    botRole: string;
    mutedRole: string;
    lockChannels: string[];
}

const SetupModel = model<DocumentFrom<SetupSchema>>('setup', new Schema({
    guild: String,
    logsChannel: String,
    memberRole: String,
    botRole: String,
    mutedRole: String,
    lockChannels: [String],
}), 'setup');

export default SetupModel;
