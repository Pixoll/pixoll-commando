import { Types } from 'mongoose';
export interface BaseSchema {
    readonly _id: Types.ObjectId;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}
export declare type DocumentFrom<T extends BaseSchema = BaseSchema, IncludeId extends boolean = false> = Omit<T, IncludeId extends true ? Exclude<keyof BaseSchema, '_id'> : keyof BaseSchema>;
