import { connectDB } from "@/app/lib/db/connectDB";
import { ProductController } from "@/app/lib/featuers/product/product.controller";
import { NextRequest } from "next/server";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";

export async function GET(req: NextRequest) {
    await connectDB();
    const user = await verifyJWT();
    if (!user || user.role !== 'admin') {
        return ApiResponse(401, null, "Admin access required.");
    }
    return ProductController.getTrash();
}
