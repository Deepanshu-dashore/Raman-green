import { Document, model, models, Schema, Types } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    image: string;
    description?: string;
    parent?: Types.ObjectId;
    children?: Types.ObjectId[];
    isDeleted?: boolean;
    deletedAt?: Date;
}

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true,
        unique: true
    },

    image: {
        type: String,
    },

    description: {
        type: String,
    },

    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },

    children: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
    }
},{timestamps: true});

export const Category = models.Category || model<ICategory>('Category', categorySchema);