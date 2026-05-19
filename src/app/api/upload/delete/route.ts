import { CloudinaryService } from "@/app/lib/services/cloudinary.service";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { urls } = await req.json() as { urls: string[] };

        if (!urls || urls.length === 0) {
            return ApiResponse(200, null, "Nothing to delete");
        }

        await Promise.all(
            urls.map((url) => CloudinaryService.delete(url, "image"))
        );

        return ApiResponse(200, null, "Images deleted successfully.");
    } catch (err: any) {
        console.error("[Upload Delete API] Error:", err);
        return ApiResponse(500, null, err.message || "Delete failed");
    }
}
