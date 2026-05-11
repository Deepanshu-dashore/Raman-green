import { connectDB } from "@/app/lib/db/connectDB";
import { Order } from "@/app/lib/featuers/order/order.model";
import { Product } from "@/app/lib/featuers/product/product.model";
import User from "@/app/lib/featuers/user/user.model";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";

export async function GET() {
    try {
        await connectDB();
        
        // Verify admin
        const user = await verifyJWT();
        if (!user || user.role !== 'admin') {
            return ApiResponse(401, null, "Unauthorized admin access.");
        }

        // Fetch stats in parallel
        const [totalOrders, totalProducts, totalUsers, revenueData] = await Promise.all([
            Order.countDocuments(),
            Product.countDocuments(),
            User.countDocuments({ role: 'customer' }),
            Order.aggregate([
                { $match: { paymentStatus: 'SUCCESS' } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ])
        ]);

        const totalRevenue = revenueData[0]?.total || 0;

        // Fetch recent orders
        const recentOrders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(5);

        return ApiResponse(200, {
            stats: {
                totalRevenue,
                totalOrders,
                totalProducts,
                totalUsers
            },
            recentOrders
        }, "Dashboard stats fetched successfully.");
    } catch (error: any) {
        return ApiResponse(500, null, error.message);
    }
}
