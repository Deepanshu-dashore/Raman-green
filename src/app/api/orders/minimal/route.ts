import { connectDB } from "@/app/lib/db/connectDB";
import { OrderController } from "@/app/lib/featuers/order/order.controller";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    await connectDB();
    return OrderController.getMinimalOrders();
}
