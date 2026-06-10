import { Document, model, models, Schema } from "mongoose";
import { ICategory } from "../category/category.model";

export interface IProduct extends Document {
    name: string;
    slug: string;
    description?: string;
    category: ICategory['_id'];
    subCategory?: ICategory['_id'];
    cultivationOrSeason: string;
    cultivation?: string;
    cultivation_city: {
        type: Schema.Types.ObjectId,
        ref: 'City'
    }[];
    variants: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant'
    }[];
    rating?: number;
    numReviews?: number;
    isFeatured?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date;
    isPublished?: boolean;
    brand?: string;
    tags?: string[];
    spaceification?: any[],
    ingredients?: string[],
    declaration?: string,
    certificates?: string[]; // Array of Certificate IDs
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
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },

    cultivationOrSeason: {
        type: String,
        required: true
    },

    cultivation: {
        type: String,
        required: false
    },

    cultivation_city: [
        {
            type: Schema.Types.ObjectId,
            ref: 'City'
        }
    ],

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

    spaceification: {
        type: [{
            title: String,
            value: String
        }],
        default: []
    },

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

    deletedAt: {
        type: Date,
    },

    isPublished: {
        type: Boolean,
        default: false
    },

    tags: {
        type: [String],
        default: []
    },

    ingredients: {
        type: [String],
        default: []
    },

    brand: {
        type: String,
    },

    declaration: {
        type: String,
    }
}, { timestamps: true });

delete models.Product;
export const Product = models.Product || model<IProduct>('Product', productSchema);
// Product.syncIndexes().catch(err => console.log("Product index sync skipped:", err));