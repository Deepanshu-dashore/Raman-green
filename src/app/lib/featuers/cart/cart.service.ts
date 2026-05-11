import { Cart, ICart, ICartItem } from "./cart.model";

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
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [], totalItems: 0, totalPrice: 0 });
        }

        // Check if item already exists in cart (same product and same variant)
        const itemIndex = cart.items.findIndex((item: ICartItem) => 
            item.product.toString() === productId && 
            JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, variant, quantity } as any);
        }

        // Calculate totals
        // Note: In a real app, you'd fetch prices from the Product model
        // For now, we'll assume price is passed or handled elsewhere
        
        await cart.save();
        return cart;
    }

    /**
     * Remove item from cart
     */
    static async removeFromCart(userId: string, productId: string, variant: any): Promise<ICart | null> {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return null;

        cart.items = cart.items.filter((item: ICartItem) => 
            !(item.product.toString() === productId && JSON.stringify(item.variant) === JSON.stringify(variant))
        ) as any;

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
