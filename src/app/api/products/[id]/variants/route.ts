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
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
        return ApiResponse(400, null, "Content-Type must be multipart/form-data.");
    }
    const formData = await req.formData();
    return VariantController.create(id, formData);
}
