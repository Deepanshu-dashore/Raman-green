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

    static async getMyOrders(all?: boolean) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            let orders;
            if (all && user.role === 'admin') {
                orders = await OrderService.getAllOrders();
            } else {
                orders = await OrderService.getUserOrders(user.id!);
            }
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
            const orderUserId = order.user?._id?.toString() || order.user?.toString();
            if (orderUserId !== user.id && user.role !== 'admin') {
                return ApiResponse(403, null, "Forbidden.");
            }

            return ApiResponse(200, order, "Order details fetched.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async updateStatus(id: string, status?: string, trackingId?: string) {
        try {
            const user = await verifyJWT();
            if (!user || user.role !== 'admin') return ApiResponse(401, null, "Admin only.");

            const order = await OrderService.updateOrderStatus(id, status, trackingId);
            return ApiResponse(200, order, "Order updated successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getMinimalOrders() {
        try {
            const user = await verifyJWT();
            if (!user || user.role !== 'admin') return ApiResponse(401, null, "Admin only.");

            const orders = await OrderService.getMinimalOrders();
            return ApiResponse(200, orders, "Minimal orders fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
