import { Document, model, models, Schema } from "mongoose";

export interface IInventory extends Document {
    variantId: Schema.Types.ObjectId;
    productId: Schema.Types.ObjectId;
    batchNumber: string;
    mfgDate: Date;
    expiryDate: Date;
    availableQty: number;
    reservedQty: number;
    lowStockLimit: number;
    notes: string;
}

const inventorySchema = new Schema<IInventory>({
    variantId: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    batchNumber: {
        type: String,
        required: true
    },
    mfgDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    availableQty: {
        type: Number,
        required: true
    },
    reservedQty: {
        type: Number,
        required: true
    },

    lowStockLimit: {
        type: Number,
        required: true,
        default: 10
    },

    notes: {
        type: String,
    }
}, { timestamps: true });

export const Inventory = models.Inventory || model<IInventory>('Inventory', inventorySchema);       
