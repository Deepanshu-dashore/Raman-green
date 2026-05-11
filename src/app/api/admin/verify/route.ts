import { connectDB } from "@/app/lib/db/connectDB";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";

export async function GET() {
    await connectDB();
    const user = await verifyJWT();

    if (!user || user.role !== 'admin') {
        return ApiResponse(401, null, "Unauthorized admin.");
    }

    return ApiResponse(200, user, "Admin verified.");
}
