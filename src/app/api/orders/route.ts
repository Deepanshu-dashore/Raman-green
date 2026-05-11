import { connectDB } from "@/app/lib/db/connectDB";
import { OrderController } from "@/app/lib/featuers/order/order.controller";
import { NextRequest } from "next/server";

export async function GET() {
    await connectDB();
    return OrderController.getMyOrders();
}

export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    return OrderController.create(body);
}
