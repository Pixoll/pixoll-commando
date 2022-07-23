import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface WelcomeSchema extends BaseSchema {
    guild: string;
    channel: string;
    message: string;
}

const WelcomeModel = model<DocumentFrom<WelcomeSchema>>('welcome', new Schema({
    guild: String,
    channel: String,
    message: String,
}), 'welcome');

export default WelcomeModel;
