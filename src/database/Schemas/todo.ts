import { model, Schema } from 'mongoose';
import { BaseSchema, DocumentFrom } from './base';

export interface TodoSchema extends BaseSchema {
    user: string;
    list: string[];
}

const TodoModel = model<DocumentFrom<TodoSchema>>('todo', new Schema({
    user: String,
    list: [String],
}), 'todo');

export default TodoModel;
