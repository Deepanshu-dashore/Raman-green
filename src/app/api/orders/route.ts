import { connectDB } from "@/app/lib/db/connectDB";
import { OrderController } from "@/app/lib/featuers/order/order.controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await connectDB();
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "true";
    return OrderController.getMyOrders(all);
}

export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    return OrderController.create(body);
}
