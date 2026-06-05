import { connectDB } from "@/app/lib/db/connectDB";
import { CategoryController } from "@/app/lib/featuers/category/category.controller";
import { NextRequest } from "next/server";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    return CategoryController.getBySlug(id); // Using ID or Slug depending on how you want to search
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const user = await verifyJWT();
    if (!user || user.role !== 'admin') {
        return ApiResponse(401, null, "Admin access required.");
    }
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        return CategoryController.update(id, formData);
    } else {
        const body = await req.json();
        return CategoryController.update(id, body);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const user = await verifyJWT();
    if (!user || user.role !== 'admin') {
        return ApiResponse(401, null, "Admin access required.");
    }
    const { id } = await params;
    return CategoryController.delete(id);
}
