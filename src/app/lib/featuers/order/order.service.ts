import { Order, IOrder } from "./order.model";

export class OrderService {
    /**
     * Create a new order
     */
    static async createOrder(data: Partial<IOrder>): Promise<IOrder> {
        const order = new Order(data);
        return await order.save();
    }

    /**
     * Get order by ID
     */
    static async getOrderById(id: string): Promise<IOrder | null> {
        return await Order.findById(id).populate("user items.product");
    }

    /**
     * Get user's orders
     */
    static async getUserOrders(userId: string): Promise<IOrder[]> {
        return await Order.find({ user: userId }).sort({ createdAt: -1 });
    }

    /**
     * Update order status
     */
    static async updateOrderStatus(id: string, status: string): Promise<IOrder | null> {
        return await Order.findByIdAndUpdate(id, { status }, { new: true });
    }

    /**
     * Get all orders (for admin)
     */
    static async getAllOrders(): Promise<IOrder[]> {
        return await Order.find().populate("user").sort({ createdAt: -1 });
    }
}
