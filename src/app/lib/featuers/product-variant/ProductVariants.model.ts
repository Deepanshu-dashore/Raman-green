import { Document, model, models, Schema } from "mongoose";

export interface IProductVariant extends Document {
    productId: Schema.Types.ObjectId;
    basePrice: number;
    discountedPrice: number;
    unit: Schema.Types.ObjectId;
    size: number;
    weight: number;
    images?: string[];
    stock: number;
    sku: string;
}

const productVariantSchema = new Schema<IProductVariant>({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    images: [
        {
            type: String,
        }
    ],
    
    basePrice: {
       type: Number,
       required: true
   },

    discountedPrice: {
        type: Number,
    },
    unit: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
    },
    size: {
        type: Number,
    },
    weight: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    sku: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const ProductVariant = models.ProductVariant || model<IProductVariant>('ProductVariant', productVariantSchema);