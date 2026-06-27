import { CartService } from "./cart.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { verifyJWT } from "../../middlewares/verifyJWT";
import { User } from "../../db/index.model";

export class CartController {
    static async getMyCart() {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const dbUser = await User.findById(user.id);
            if (!dbUser) return ApiResponse(401, null, "Unauthorized: User not found.");
            if (dbUser.role !== "customer") {
                return ApiResponse(403, null, "Access denied. Only customers are allowed to manage carts.");
            }

            const cart = await CartService.getCart(user.id!);
            return ApiResponse(200, cart, "Cart fetched successfully.");
        } catch (error: any) {
            console.error("Error in getMyCart:", error);
            return ApiResponse(500, null, error.message);
        }
    }

    static async addToCart(reqData: any) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const dbUser = await User.findById(user.id);
            if (!dbUser) return ApiResponse(401, null, "Unauthorized: User not found.");
            if (dbUser.role !== "customer") {
                return ApiResponse(403, null, "Access denied. Only customers are allowed to manage carts.");
            }

            const { productId, variant, quantity } = reqData;
            if (!productId || !quantity) return ApiResponse(400, null, "Missing fields.");

            const cart = await CartService.addToCart(user.id!, productId, variant, quantity);
            return ApiResponse(200, cart, "Item added to cart.");
        } catch (error: any) {
            console.error("Error in addToCart:", error);
            return ApiResponse(500, null, error.message);
        }
    }

    static async updateItemQuantity(reqData: any) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const dbUser = await User.findById(user.id);
            if (!dbUser) return ApiResponse(401, null, "Unauthorized: User not found.");
            if (dbUser.role !== "customer") {
                return ApiResponse(403, null, "Access denied. Only customers are allowed to manage carts.");
            }

            const { productId, variant, quantity } = reqData; // quantity is diff
            if (!productId || quantity === undefined) return ApiResponse(400, null, "Missing fields.");

            const cart = await CartService.addToCart(user.id!, productId, variant, quantity);
            return ApiResponse(200, cart, "Cart quantity updated.");
        } catch (error: any) {
            console.error("Error in updateItemQuantity:", error);
            return ApiResponse(500, null, error.message);
        }
    }

    static async removeItem(reqData: any) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const dbUser = await User.findById(user.id);
            if (!dbUser) return ApiResponse(401, null, "Unauthorized: User not found.");
            if (dbUser.role !== "customer") {
                return ApiResponse(403, null, "Access denied. Only customers are allowed to manage carts.");
            }

            const { productId, variant } = reqData;
            const cart = await CartService.removeFromCart(user.id!, productId, variant);
            return ApiResponse(200, cart, "Item removed from cart.");
        } catch (error: any) {
            console.error("Error in removeItem:", error);
            return ApiResponse(500, null, error.message);
        }
    }

    static async getCartCount() {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(200, { count: 0 }, "Not authenticated.");

            const dbUser = await User.findById(user.id);
            if (!dbUser || dbUser.role !== "customer") {
                return ApiResponse(200, { count: 0 }, "Not a customer.");
            }

            const cart = await CartService.getCart(user.id!);
            if (!cart) return ApiResponse(200, { count: 0 }, "Cart not found.");

            return ApiResponse(200, { count: cart.totalItems || 0 }, "Cart count fetched.");
        } catch (error: any) {
            console.error("Error in getCartCount:", error);
            return ApiResponse(500, null, error.message);
        }
    }
}

export const updateItemQuantity = CartController.updateItemQuantity;
