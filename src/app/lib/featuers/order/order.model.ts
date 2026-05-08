import {Document, model, models, Schema} from "mongoose";
import { IUser } from "../user/user.model";
import { IProduct } from "../product/product.model";

export interface IOrderItem extends Document {
    product: IProduct['_id'];
    variant: {
        weight: String,
        price: Number,
        stock: Number,
        sku: String
    }
    quantity: number;
    totalAmount: number;
}

export interface IOrder extends Document {
    user: IUser['_id'];
    items: IOrderItem[];
    totalPrice: number;
    totalItems: number;
    paymentMethod: string;
    paymentStatus: string;
    trackingId: string;
    status: string;
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
    }
}, { timestamps: true });

export const Order = models.Order || model<IOrder>('Order', orderSchema);