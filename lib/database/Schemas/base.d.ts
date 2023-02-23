import { Types } from 'mongoose';
export interface BaseSchema {
    readonly _id: Types.ObjectId;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}
export type DocumentFrom<T extends BaseSchema | (Omit<BaseSchema, '_id'> & {
    readonly _id: string;
}) = BaseSchema, IncludeId extends boolean = false> = Omit<T, IncludeId extends true ? Exclude<keyof BaseSchema, '_id'> : keyof BaseSchema> & (IncludeId extends true ? {
    readonly _id: string;
} : object);
