import { Cart, ICart, ICartItem } from "./cart.model";
import { Product } from "../product/product.model";
import mongoose from "mongoose";

function isSameVariant(v1: any, v2: any): boolean {
    if (!v1 || !v2) return v1 === v2;

    const obj1 = typeof v1.toObject === "function" ? v1.toObject() : v1;
    const obj2 = typeof v2.toObject === "function" ? v2.toObject() : v2;

    const sku1 = obj1.sku ? obj1.sku.toString().trim().toLowerCase() : "";
    const sku2 = obj2.sku ? obj2.sku.toString().trim().toLowerCase() : "";

    const weight1 = obj1.weight ? obj1.weight.toString().trim().toLowerCase() : "";
    const weight2 = obj2.weight ? obj2.weight.toString().trim().toLowerCase() : "";

    const id1 = (obj1._id || obj1.id || "").toString();
    const id2 = (obj2._id || obj2.id || "").toString();

    if (id1 && id2) {
        return id1 === id2;
    }

    if (sku1 && sku2) {
        return sku1 === sku2;
    }

    return weight1 === weight2;
}

export class CartService {
    /**
     * Get user's cart
     */
    static async getCart(userId: string): Promise<ICart | null> {
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart) return null;

        let cartUpdated = false;
        const ProductVariant = (await import("../product-variant/ProductVariants.model")).ProductVariant;

        for (const item of cart.items) {
            const currentPrice = item.price || item.variant?.price || 0;
            if (currentPrice === 0 || !item.variant?.sku) {
                let variantDoc = null;
                
                if (item.variant?.sku) {
                    variantDoc = await ProductVariant.findOne({ sku: item.variant.sku, isDeleted: { $ne: true } });
                } else if (item.variant?.weight) {
                    const weightStr = item.variant.weight.toString().trim();
                    const match = weightStr.match(/^([\d.]+)/);
                    const numericWeight = match ? parseFloat(match[1]) : NaN;
                    
                    if (!isNaN(numericWeight)) {
                        variantDoc = await ProductVariant.findOne({ 
                            productId: item.product?._id || item.product, 
                            weight: numericWeight, 
                            isDeleted: { $ne: true } 
                        });
                    }
                    if (!variantDoc) {
                        variantDoc = await ProductVariant.findOne({ 
                            productId: item.product?._id || item.product, 
                            isDeleted: { $ne: true } 
                        });
                    }
                } else {
                    variantDoc = await ProductVariant.findOne({ 
                        productId: item.product?._id || item.product, 
                        isDeleted: { $ne: true } 
                    });
                }

                if (variantDoc) {
                    const priceVal = variantDoc.discountedPrice || variantDoc.basePrice || 0;
                    item.variant = {
                        _id: variantDoc._id.toString(),
                        weight: variantDoc.weight?.toString() ?? item.variant?.weight ?? "",
                        price: priceVal,
                        stock: variantDoc.lowStockAlert ?? item.variant?.stock ?? 10,
                        sku: variantDoc.sku ?? item.variant?.sku ?? "",
                        images: variantDoc.images ?? item.variant?.images ?? [],
                    } as any;
                    item.price = priceVal;
                    cartUpdated = true;
                }
            }
        }

        if (cartUpdated) {
            cart.totalItems = cart.items.reduce((sum: number, item: ICartItem) => sum + (item.quantity || 0), 0);
            cart.totalPrice = cart.items.reduce((sum: number, item: ICartItem) => {
                const itemPrice = item.variant?.price || (item as any).price || 0;
                return sum + (item.quantity * itemPrice);
            }, 0);
            await cart.save();
        }

        return cart;
    }

    /**
     * Add item to cart or update quantity
     */
    static async addToCart(userId: string, productId: string, variant: any, quantity: number): Promise<ICart> {
        // Resolve product ID (slug or ObjectId) as before
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

        // If variant is provided as an ID (string), fetch full variant document
        let variantData: any = variant;
        if (typeof variant === "string" && mongoose.isValidObjectId(variant)) {
            const ProductVariant = (await import("../product-variant/ProductVariants.model")).ProductVariant;
            const variantDoc = await ProductVariant.findById(variant).lean();
            if (variantDoc) {
                variantData = {
                    _id: variantDoc._id.toString(),
                    weight: variantDoc.weight?.toString() ?? "",
                    price: variantDoc.discountedPrice ?? variantDoc.basePrice ?? 0,
                    images: variantDoc.images ?? [],
                    sku: variantDoc.sku ?? "",
                };
            }
        }

        // Proceed with cart lookup/creation using actualProductId
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [], totalItems: 0, totalPrice: 0 });
        }

        // Check if item already exists in cart (same product and same variant)
        const itemIndex = cart.items.findIndex((item: ICartItem) =>
            item.product &&
            item.product.toString() === actualProductId &&
            isSameVariant(item.variant, variantData)
        );

        let price = variantData?.discountedPrice || variantData?.price || variantData?.basePrice || 0;

        if (price === 0) {
            const ProductVariant = (await import("../product-variant/ProductVariants.model")).ProductVariant;
            let variantDoc = null;
            if (variantData?.sku) {
                variantDoc = await ProductVariant.findOne({ sku: variantData.sku, isDeleted: { $ne: true } }).lean();
            } else if (variantData?.weight) {
                const weightStr = variantData.weight.toString().trim();
                const match = weightStr.match(/^([\d.]+)/);
                const numericWeight = match ? parseFloat(match[1]) : NaN;
                
                if (!isNaN(numericWeight)) {
                    variantDoc = await ProductVariant.findOne({ 
                        productId: actualProductId, 
                        weight: numericWeight, 
                        isDeleted: { $ne: true } 
                    }).lean();
                }
                if (!variantDoc) {
                    variantDoc = await ProductVariant.findOne({ 
                        productId: actualProductId, 
                        isDeleted: { $ne: true } 
                    }).lean();
                }
            }
            if (variantDoc) {
                price = variantDoc.discountedPrice || variantDoc.basePrice || 0;
                variantData.price = price;
                if (!variantData._id) variantData._id = variantDoc._id.toString();
                if (!variantData.images || variantData.images.length === 0) {
                    variantData.images = variantDoc.images || [];
                }
            }
        }

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            if (cart.items[itemIndex].quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                if (price > 0) {
                    cart.items[itemIndex].price = price;
                    if (cart.items[itemIndex].variant) {
                        cart.items[itemIndex].variant.price = price;
                    }
                }
            }
        } else {
            if (quantity > 0) {
                cart.items.push({ product: actualProductId, variant: variantData, quantity, price } as any);
            }
        }

        // Calculate totals
        cart.totalItems = cart.items.reduce((sum: number, item: ICartItem) => sum + (item.quantity || 0), 0);
        cart.totalPrice = cart.items.reduce((sum: number, item: ICartItem) => {
            const itemPrice = item.variant?.price || (item as any).price || 0;
            return sum + (item.quantity * itemPrice);
        }, 0);

        await cart.save();
        await cart.populate("items.product");
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
            !(item.product && item.product.toString() === actualProductId && isSameVariant(item.variant, variant))
        ) as any;

        // Calculate totals
        cart.totalItems = cart.items.reduce((sum: number, item: ICartItem) => sum + (item.quantity || 0), 0);
        cart.totalPrice = cart.items.reduce((sum: number, item: ICartItem) => {
            const itemPrice = item.variant?.price || (item as any).price || 0;
            return sum + (item.quantity * itemPrice);
        }, 0);

        await cart.save();
        await cart.populate("items.product");
        return cart;
    }

    /**
     * Clear cart
     */
    static async clearCart(userId: string): Promise<void> {
        await Cart.findOneAndDelete({ user: userId });
    }
}
