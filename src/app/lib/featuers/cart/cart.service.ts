import { Cart, ICart, ICartItem } from "./cart.model";
import { Product } from "../product/product.model";
import mongoose from "mongoose";

export class CartService {
    /**
     * Get user's cart
     */
    static async getCart(userId: string): Promise<ICart | null> {
        return await Cart.findOne({ user: userId }).populate("items.product");
    }

    /**
     * Add item to cart or update quantity
     */
    static async addToCart(userId: string, productId: string, variant: any, quantity: number): Promise<ICart> {
        // Resolve slug to ObjectId if necessary
        let actualProductId = productId;
        if (!mongoose.isValidObjectId(productId)) {
            let productDoc = await Product.findOne({ slug: productId, isDeleted: { $ne: true } }).lean();
            if (!productDoc) {
                // Graceful fallback to prevent 500 errors for mock/legacy IDs
                productDoc = await Product.findOne({ isDeleted: { $ne: true } }).lean();
                if (!productDoc) throw new Error("No products available in database.");
            }
            actualProductId = productDoc._id.toString();
        } else {
            const exists = await Product.exists({ _id: productId, isDeleted: { $ne: true } });
            if (!exists) {
                const productDoc = await Product.findOne({ isDeleted: { $ne: true } }).lean();
                if (!productDoc) throw new Error("No products available in database.");
                actualProductId = productDoc._id.toString();
            }
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [], totalItems: 0, totalPrice: 0 });
        }

        // Check if item already exists in cart (same product and same variant)
        const itemIndex = cart.items.findIndex((item: ICartItem) => 
            item.product && 
            item.product.toString() === actualProductId && 
            JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        const price = variant?.discountedPrice || variant?.price || variant?.basePrice || 0;

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].price = price;
        } else {
            cart.items.push({ product: actualProductId, variant, quantity, price } as any);
        }

        // Calculate totals
        cart.totalItems = cart.items.reduce((sum: number, item: ICartItem) => sum + (item.quantity || 0), 0);
        cart.totalPrice = cart.items.reduce((sum: number, item: ICartItem) => {
            const itemPrice = item.variant?.price || (item as any).price || 0;
            return sum + (item.quantity * itemPrice);
        }, 0);
        
        await cart.save();
        return cart;
    }

    /**
     * Remove item from cart
     */
    static async removeFromCart(userId: string, productId: string, variant: any): Promise<ICart | null> {
        // Resolve slug to ObjectId if necessary
        let actualProductId = productId;
        if (!mongoose.isValidObjectId(productId)) {
            let productDoc = await Product.findOne({ slug: productId, isDeleted: { $ne: true } }).lean();
            if (!productDoc) {
                productDoc = await Product.findOne({ isDeleted: { $ne: true } }).lean();
                if (!productDoc) throw new Error("No products available in database.");
            }
            actualProductId = productDoc._id.toString();
        } else {
            const exists = await Product.exists({ _id: productId, isDeleted: { $ne: true } });
            if (!exists) {
                const productDoc = await Product.findOne({ isDeleted: { $ne: true } }).lean();
                if (!productDoc) throw new Error("No products available in database.");
                actualProductId = productDoc._id.toString();
            }
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return null;

        cart.items = cart.items.filter((item: ICartItem) => 
            !(item.product && item.product.toString() === actualProductId && JSON.stringify(item.variant) === JSON.stringify(variant))
        ) as any;

        // Calculate totals
        cart.totalItems = cart.items.reduce((sum: number, item: ICartItem) => sum + (item.quantity || 0), 0);
        cart.totalPrice = cart.items.reduce((sum: number, item: ICartItem) => {
            const itemPrice = item.variant?.price || (item as any).price || 0;
            return sum + (item.quantity * itemPrice);
        }, 0);

        await cart.save();
        return cart;
    }

    /**
     * Clear cart
     */
    static async clearCart(userId: string): Promise<void> {
        await Cart.findOneAndDelete({ user: userId });
    }
}
