import { CloudinaryService } from "@/app/lib/services/cloudinary.service";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "products";

        if (!file) {
            return ApiResponse(400, null, "No file provided");
        }

        const secureUrl = await CloudinaryService.upload(file, folder, "image");

        if (!secureUrl) {
            return ApiResponse(500, null, "Upload failed");
        }

        return ApiResponse(200, secureUrl, "Image uploaded successfully.");
    } catch (err: any) {
        console.error("[Upload API] Error:", err);
        return ApiResponse(500, null, err.message || "Upload failed");
    }
}
