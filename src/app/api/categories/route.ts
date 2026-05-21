import { connectDB } from "@/app/lib/db/connectDB";
import { CategoryController } from "@/app/lib/featuers/category/category.controller";
import { NextRequest } from "next/server";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";

export async function GET() {
    await connectDB();
    return CategoryController.getAll();
}

export async function POST(req: NextRequest) {
    await connectDB();
    const user = await verifyJWT();
    if (!user || user.role !== 'admin') {
        return ApiResponse(401, null, "Admin access required.");
    }
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
        return ApiResponse(400, null, "Content-Type must be multipart/form-data.");
    }
    const formData = await req.formData();
    return CategoryController.create(formData);
}
