import { CartService } from "./cart.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { verifyJWT } from "../../middlewares/verifyJWT";

export class CartController {
    static async getMyCart() {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const cart = await CartService.getCart(user.id!);
            return ApiResponse(200, cart, "Cart fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async addToCart(reqData: any) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const { productId, variant, quantity } = reqData;
            if (!productId || !quantity) return ApiResponse(400, null, "Missing fields.");

            const cart = await CartService.addToCart(user.id!, productId, variant, quantity);
            return ApiResponse(200, cart, "Item added to cart.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async removeItem(reqData: any) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const { productId, variant } = reqData;
            const cart = await CartService.removeFromCart(user.id!, productId, variant);
            return ApiResponse(200, cart, "Item removed from cart.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
