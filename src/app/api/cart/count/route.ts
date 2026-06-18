import { connectDB } from "@/app/lib/db/connectDB";
import { CartController } from "@/app/lib/featuers/cart/cart.controller";

export async function GET() {
    await connectDB();
    return CartController.getCartCount();
}
