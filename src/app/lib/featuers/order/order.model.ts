import {Document, model, models, Schema, Types} from "mongoose";
import { IProduct } from "../product/product.model";

export interface IOrderItem extends Document {
    product: IProduct['_id'];
    variant: {
        weight: string,
        price: number,
        stock: number,
        sku: string
    }
    quantity: number;
    totalAmount: number;
}

export interface IOrder extends Document {
    user: Types.ObjectId | any;
    items: IOrderItem[];
    totalPrice: number;
    totalItems: number;
    paymentMethod: string;
    paymentStatus: string;
    trackingId: string;
    status: string;
    statusHistory: Array<{
        status: string;
        updatedAt: Date;
    }>;
    address: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
    };
}

const orderSchema = new Schema<IOrder>({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            variant: {
                weight: String,
                price: Number,
                stock: Number,
                sku: String
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            price:{
                type: Number,
                required: true,
                default: 0
            }
        }
    ],

    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },

    totalItems: {
        type: Number,
        required: true,
        default: 0
    },

    paymentMethod: {
    type: String,
    enum: ['ONLINE', 'COD']
  },

  address: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true }
  },

  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  },

    trackingId: String,

    status: {
        type: String,
        enum: [
      'PLACED',
      'CONFIRMED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED'
    ],
    default: 'PLACED'
    },

    statusHistory: [
        {
            status: {
                type: String,
                required: true
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

export const Order = models.Order || model<IOrder>('Order', orderSchema);