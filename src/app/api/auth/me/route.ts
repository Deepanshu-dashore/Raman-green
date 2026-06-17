import { connectDB } from "@/app/lib/db/connectDB";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";
import User from "@/app/lib/featuers/user/user.model";

export async function GET() {
    try {
        await connectDB();
        const userPayload = await verifyJWT();
        if (!userPayload) {
            return ApiResponse(401, null, "Not authenticated");
        }

        const user = await User.findById(userPayload.id).select("-password");
        if (!user) {
            return ApiResponse(404, null, "User not found");
        }

        return ApiResponse(200, user, "User authenticated successfully");
    } catch (error: any) {
        return ApiResponse(500, null, error.message || "Internal server error");
    }
}

