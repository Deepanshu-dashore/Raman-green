import { Order, IOrder } from "./order.model";

export class OrderService {

    /**
     * Get order by ID
     */
    static async getOrderById(id: string): Promise<IOrder | null> {
        return await Order.findById(id).populate("user items.product");
    }

    /**
     * Create a new order
     */
    static async createOrder(data: Partial<IOrder>): Promise<IOrder> {
        const status = data.status || 'PLACED';
        const order = new Order({
            ...data,
            statusHistory: [{ status, updatedAt: new Date() }]
        });
        return await order.save();
    }

    /**
     * Get user's orders
     */
    static async getUserOrders(userId: string): Promise<IOrder[]> {
        return await Order.find({ user: userId }).sort({ createdAt: -1 });
    }

    /**
     * Update order status and/or tracking ID
     */
    static async updateOrderStatus(id: string, status?: string, trackingId?: string): Promise<IOrder | null> {
        const order = await Order.findById(id);
        if (!order) return null;

        if (status && order.status !== status) {
            order.status = status;
            if (!order.statusHistory) {
                order.statusHistory = [];
            }
            order.statusHistory.push({ status, updatedAt: new Date() } as any);
        }
        if (trackingId !== undefined) {
            order.trackingId = trackingId;
        }
        return await order.save();
    }

    /**
     * Get all orders (for admin)
     */
    static async getAllOrders(): Promise<IOrder[]> {
        return await Order.find().populate("user").sort({ createdAt: -1 });
    }

    /**
     * Get all orders with minimal fields (for admin list/map view)
     */
    static async getMinimalOrders(): Promise<IOrder[]> {
        return await Order.find()
            .select('_id createdAt user totalPrice status paymentMethod paymentStatus address trackingId statusHistory')
            .populate("user", "name email")
            .sort({ createdAt: -1 });
    }
}
