import { OrderService } from "./order.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { verifyJWT } from "../../middlewares/verifyJWT";
import { CartService } from "../cart/cart.service";

export class OrderController {
    static async create(reqData: any) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const order = await OrderService.createOrder({ ...reqData, user: user.id });
            
            // Clear cart from database since order is placed
            await CartService.clearCart(user.id!);
            
            return ApiResponse(201, order, "Order placed successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getMyOrders() {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const orders = await OrderService.getUserOrders(user.id!);
            return ApiResponse(200, orders, "Orders fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getOrderDetails(id: string) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const order = await OrderService.getOrderById(id);
            if (!order) return ApiResponse(404, null, "Order not found.");

            // Security: Only owner or admin can view
            if (order.user.toString() !== user.id && user.role !== 'admin') {
                return ApiResponse(403, null, "Forbidden.");
            }

            return ApiResponse(200, order, "Order details fetched.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async updateStatus(id: string, status: string) {
        try {
            const user = await verifyJWT();
            if (!user || user.role !== 'admin') return ApiResponse(401, null, "Admin only.");

            const order = await OrderService.updateOrderStatus(id, status);
            return ApiResponse(200, order, "Order status updated.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
