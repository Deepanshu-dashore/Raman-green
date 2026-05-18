import { Document, model, models, Schema } from "mongoose";
import { ICategory } from "../category/category.model";

export interface IProduct extends Document {
    name: string;
    slug: string;
    description?: string;
    category: ICategory['_id'];
    variants: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant'
    }[];
    rating?: number;
    numReviews?: number;
    isFeatured?: boolean;
    isDeleted?: boolean;
    isPublished?: boolean;
    brand?: string;
    tags?: string[];
    certificates?: string[]; // Array of Certificate IDs
    packaging?: string[]; // Array of Packaging IDs
}

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String,
    },

    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    variants: [
        {
            type: Schema.Types.ObjectId,
            ref: 'ProductVariant'
        }
    ],

    certificates: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Certificate'
        }
    ],

    packaging: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Packaging'
        }
    ],

    rating: {
        type: Number,
    },

    numReviews: {
        type: Number,
    },

    isFeatured: {
        type: Boolean,
        default: false
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    isPublished: {
        type: Boolean,
        default: false
    },

    tags: {
        type: [String],
        default: []
    },

    brand: {
        type: String,
    }
}, { timestamps: true });

export const Product = models.Product || model<IProduct>('Product', productSchema);