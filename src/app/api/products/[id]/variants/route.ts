import { connectDB } from "@/app/lib/db/connectDB";
import { VariantController } from "@/app/lib/featuers/product-variant/variant.controller";
import { NextRequest } from "next/server";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const user = await verifyJWT();
    if (!user || user.role !== 'admin') {
        return ApiResponse(401, null, "Admin access required.");
    }
    const { id } = await params;
    const body = await req.json();
    return VariantController.create(id, body);
}
