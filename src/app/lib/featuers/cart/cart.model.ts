import {Document, model, models, Schema} from "mongoose";
import { IUser } from "../user/user.model";
import { IProduct } from "../product/product.model";

export interface ICartItem extends Document {
    product: IProduct['_id'];
    variant: {
        weight: string,
        price: number,
        stock: number,
        sku: string,
        images?: string[]
    }
    quantity: number;
}

export interface ICart extends Document {
    user: IUser['_id'];
    items: ICartItem[];
    totalPrice: number;
    totalItems: number;
}

const cartSchema = new Schema<ICart>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
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
                sku: String,
                images: [String]
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
    }
}, { timestamps: true });

export const Cart = models.Cart || model<ICart>('Cart', cartSchema);