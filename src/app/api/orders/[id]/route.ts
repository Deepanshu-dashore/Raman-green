import { connectDB } from "@/app/lib/db/connectDB";
import { OrderController } from "@/app/lib/featuers/order/order.controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const { id } = await params;
    return OrderController.getOrderDetails(id);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();
    return OrderController.updateStatus(id, status);
}
