import { connectDB } from "@/app/lib/db/connectDB";
import { ReviewController } from "@/app/lib/featuers/product-review/review.controller";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    return ReviewController.delete(id);
}
