import { connectDB } from "@/app/lib/db/connectDB";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";
import User from "@/app/lib/featuers/user/user.model";
import Customer from "@/app/lib/featuers/customer/customer.model";
import { NextRequest } from "next/server";
import { sanitizeNoSql } from "@/app/lib/utils/sanitize";

export async function GET() {
    try {
        await connectDB();
        const userPayload = await verifyJWT();
        if (!userPayload) {
            return ApiResponse(401, null, "Not authenticated");
        }

        if (userPayload.role === 'admin') {
            const user = await User.findById(userPayload.id).select("-password");
            if (!user) {
                return ApiResponse(404, null, "Admin user not found");
            }
            return ApiResponse(200, user, "Admin authenticated successfully");
        } else {
            const customer = await Customer.findById(userPayload.id).select("-password");
            if (!customer) {
                return ApiResponse(404, null, "Customer not found");
            }
            return ApiResponse(200, customer, "Customer authenticated successfully");
        }
    } catch (error: any) {
        return ApiResponse(500, null, error.message || "Internal server error");
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const userPayload = await verifyJWT();
        if (!userPayload) {
            return ApiResponse(401, null, "Not authenticated");
        }

        const body = await req.json();
        const sanitizedBody = sanitizeNoSql(body);
        const { name, email, phone, image } = sanitizedBody;

        if (userPayload.role === 'admin') {
            if (!name) {
                return ApiResponse(400, null, "Name is required.");
            }

            // Check if phone already in use by another admin user
            if (phone) {
                const existingPhone = await User.findOne({ phone, _id: { $ne: userPayload.id } });
                if (existingPhone) {
                    return ApiResponse(400, null, "Phone number is already in use by another account.");
                }
            }

            // Check if email already in use by another admin user
            if (email) {
                const existingEmail = await User.findOne({ email, _id: { $ne: userPayload.id } });
                if (existingEmail) {
                    return ApiResponse(400, null, "Email address is already in use by another account.");
                }
            }

            const updatedUser = await User.findByIdAndUpdate(
                userPayload.id,
                { name, email, phone, image },
                { new: true, runValidators: true }
            ).select("-password");

            if (!updatedUser) {
                return ApiResponse(404, null, "Admin user not found");
            }
            return ApiResponse(200, updatedUser, "Admin profile updated successfully");
        } else {
            if (!name || !phone || !email) {
                return ApiResponse(400, null, "Name, email, and phone are required.");
            }

            // Check if email already in use by another customer
            const existingEmail = await Customer.findOne({ email, _id: { $ne: userPayload.id } });
            if (existingEmail) {
                return ApiResponse(400, null, "Email address is already in use by another account.");
            }

            // Check if phone already in use by another customer
            const existingPhone = await Customer.findOne({ phone, _id: { $ne: userPayload.id } });
            if (existingPhone) {
                return ApiResponse(400, null, "Phone number is already in use by another account.");
            }

            const updatedCustomer = await Customer.findByIdAndUpdate(
                userPayload.id,
                { name, email, phone, image },
                { new: true, runValidators: true }
            ).select("-password");

            if (!updatedCustomer) {
                return ApiResponse(404, null, "Customer not found");
            }
            return ApiResponse(200, updatedCustomer, "Customer profile updated successfully");
        }
    } catch (error: any) {
        return ApiResponse(500, null, error.message || "Internal server error");
    }
}

