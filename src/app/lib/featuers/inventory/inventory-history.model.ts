import { model, models, Schema } from "mongoose";

export interface InventoryHistory {
    _id?: string;
    inventory: Schema.Types.ObjectId;
    actionType: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    note?: string;
    referenceId?: string;
    referenceModel?: string;
    createdBy?: Schema.Types.ObjectId;
}

const InventoryHistorySchema = new Schema<InventoryHistory>({
    inventory: {
        type: Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },
    actionType: {
        type: String,
        required: true,
        enum: [
            'STOCK_IN',
            'SALE',
            'RETURN',
            'MANUAL_UPDATE',
            'DAMAGED',
            'CANCELLED_ORDER',
            'EXPIRY'
        ]
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },

    previousStock: {
        type: Number,
        required: true,
        min: 0
    },

    newStock: {
        type: Number,
        required: true,
        min: 0
    },

    note: {
        type: String,
        trim: true
    },

    referenceId: {
        type: String,
        index: true // very important for fast lookups
    },

    referenceModel: {
        type: String,
        enum: ['ProductVariant', 'StockIn', 'Sale', 'Return', 'ManualUpdate', 'Damage', 'CancelOrder'],
        index: true
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

}, { timestamps: true });

export const InventoryHistory = models.InventoryHistory || model<InventoryHistory>('InventoryHistory', InventoryHistorySchema);