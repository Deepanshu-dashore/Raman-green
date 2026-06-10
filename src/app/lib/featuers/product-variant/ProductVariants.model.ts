import { Document, model, models, Schema } from "mongoose";

export interface IProductVariant extends Document {
    productId: Schema.Types.ObjectId;
    basePrice: number;
    discountedPrice: number;
    unit: Schema.Types.ObjectId;
    size: number;
    weight: number;
    images?: string[];
    imageOrder?: (
        | { type: "existing"; url: string }
        | { type: "new"; index: number }
    )[];
    packaging?: Schema.Types.ObjectId[];
    sku: string;
    usageInstructions?: string[];
    isDeleted?: boolean;
    lowStockAlert?: number;
    deletedAt?: Date;
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
    imageOrder: [
        {
            type: {
                type: String,
                enum: ["existing", "new"],
                required: true
            },
            url: {
                type: String
            },
            index: {
                type: Number
            }
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
    packaging: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Packaging'
        }
    ],
    size: {
        type: Number,
    },
    weight: {
        type: Number,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    usageInstructions: {
        type: [String]
    },

    isDeleted: {
        type: Boolean,
        default: false
    },
    lowStockAlert: {
        type: Number,
        default: 10
    },

    deletedAt: {
        type: Date,
    }
}, { timestamps: true });

delete models.ProductVariant;
export const ProductVariant = models.ProductVariant || model<IProductVariant>('ProductVariant', productVariantSchema);
ProductVariant.syncIndexes().catch(err => console.log("ProductVariant index sync skipped:", err));
