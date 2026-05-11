import { connectDB } from "@/app/lib/db/connectDB";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";
import mongoose from "mongoose";

export async function GET() {
    try {
        await connectDB();
        
        const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
        
        const healthData = {
            status: "UP",
            database: dbStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };

        return ApiResponse(200, healthData, "Raman Green API is healthy");
    } catch (error: any) {
        return ApiResponse(503, { status: "DOWN", error: error.message }, "API Health Check Failed");
    }
}
