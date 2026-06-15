import { connectDB } from "@/app/lib/db/connectDB";
import { ReviewController } from "@/app/lib/featuers/product-review/review.controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    return ReviewController.getReviews(id);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    return ReviewController.add(id, body);
}
