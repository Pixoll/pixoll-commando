import { Types } from 'mongoose';
import { Require } from '../../util';

export interface BaseSchema {
    readonly __v: number;
    readonly _id: Types.ObjectId;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BaseSchemaWithTimestamps extends Require<BaseSchema, 'createdAt' | 'updatedAt'> { }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BaseSchemaWithoutTimestamps extends Omit<BaseSchema, 'createdAt' | 'updatedAt'> { }

export type DocumentFrom<
    T extends BaseSchema | (Omit<BaseSchema, '_id'> & { readonly _id: string }) = BaseSchema,
    IncludeId extends boolean = false
> = Omit<
    T, IncludeId extends true ? Exclude<keyof BaseSchema, '_id'> : keyof BaseSchema
> & (IncludeId extends true ? { readonly _id: string } : object);
