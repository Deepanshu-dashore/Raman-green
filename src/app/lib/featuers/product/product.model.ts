import { Document, model, models, Schema } from "mongoose";
import { ICategory } from "../category/category.model";

export interface IProduct extends Document {
    name: string;
    slug: string;
    images: string[];
    description?: string;
    category: ICategory['_id'];
    basePrice: number; // Keep base price
    variants: {
        weight: string,
        price: number,
        stock: number,
        sku: string
    }[];
    rating?: number;
    numReviews?: number;
    isFeatured?: boolean;
    brand?: string;
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

    images: [
        {
            type: String,
            required: true
        }
    ],

    description: {
        type: String,
    },

    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    basePrice: {
        type: Number,
        required: true
    },

    variants: [
    {
        weight: String,
        price: Number,
        stock: Number,
        sku: String
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

    brand: {
        type: String,
    }
}, { timestamps: true });

export const Product = models.Product || model<IProduct>('Product', productSchema);