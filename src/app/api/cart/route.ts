import { connectDB } from "@/app/lib/db/connectDB";
import { CartController } from "@/app/lib/featuers/cart/cart.controller";
import { NextRequest } from "next/server";

export async function GET() {
    await connectDB();
    return CartController.getMyCart();
}

export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    return CartController.addToCart(body);
}

export async function DELETE(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    return CartController.removeItem(body);
}
