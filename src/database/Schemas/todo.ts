import { model, Schema } from 'mongoose';
import { BaseSchemaWithoutTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface TodoSchema extends BaseSchemaWithoutTimestamps {
    user: Snowflake;
    list: string[];
}

const TodoModel = model<DocumentFrom<TodoSchema>>('todo', new Schema({
    user: String,
    list: [String],
}), 'todo');

export default TodoModel;
