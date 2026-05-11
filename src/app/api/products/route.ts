import { connectDB } from "@/app/lib/db/connectDB";
import { ProductController } from "@/app/lib/featuers/product/product.controller";
import { NextRequest } from "next/server";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";

export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    return ProductController.getAll(query);
}

export async function POST(req: NextRequest) {
    await connectDB();
    const user = await verifyJWT();
    if (!user || user.role !== 'admin') {
        return ApiResponse(401, null, "Admin access required.");
    }
    const body = await req.json();
    return ProductController.create(body);
}
