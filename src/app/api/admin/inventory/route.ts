import { connectDB } from "@/app/lib/db/connectDB";
import { InventoryController } from "@/app/lib/featuers/inventory/inventory.controller";
import { NextRequest } from "next/server";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";

export async function GET(req: NextRequest) {
    await connectDB();
    const user = await verifyJWT();
    if (!user || user.role !== 'admin') {
        return ApiResponse(401, null, "Admin access required.");
    }
    return InventoryController.getAll();
}
