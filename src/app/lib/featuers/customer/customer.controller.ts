import { CustomerService } from "./customer.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { JWTHelper } from "../../utils/JWTHelper";
import { sanitizeNoSql } from "../../utils/sanitize";

export class CustomerController {
    static async register(reqData: any) {
        try {
            const sanitizedData = sanitizeNoSql(reqData);
            const { name, phone, email, password } = sanitizedData;

            if (!name || !phone || !email || !password) {
                return ApiResponse(400, null, "Name, phone, email, and password are required.");
            }

            const customer = await CustomerService.register({ name, phone, email, password });

            const customerObj = customer.toObject();
            delete customerObj.password;

            return ApiResponse(201, { user: customerObj }, "Customer registered successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message || "An error occurred during registration.");
        }
    }

    static async login(reqData: any) {
        try {
            const sanitizedData = sanitizeNoSql(reqData);
            const { identifier, password } = sanitizedData;

            if (!identifier || !password) {
                return ApiResponse(400, null, "Identifier and password are required.");
            }

            const { customer, token } = await CustomerService.login(identifier, password);

            const response = ApiResponse(200, { user: customer, token }, "Login successful.");

            response.cookies.set("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 1, // 1 day
            });

            return response;
        } catch (error: any) {
            return ApiResponse(401, null, error.message || "An error occurred during login.");
        }
    }

    static async logout(userId?: string) {
        try {
            if (userId) {
                await CustomerService.logout(userId);
            }
            const response = ApiResponse(200, null, "Logged out successfully.");
            response.cookies.delete("token");
            return response;
        } catch (error: any) {
            return ApiResponse(500, null, error.message || "Logout failed.");
        }
    }

    static async loginGoogle(reqData: any) {
        try {
            const sanitizedData = sanitizeNoSql(reqData);
            const { email, name, phone } = sanitizedData;

            if (!email || !name) {
                return ApiResponse(400, null, "Email and name are required.");
            }

            const result = await CustomerService.loginGoogle({ email, name, phone });

            if (result.phoneRequired) {
                return ApiResponse(200, { phoneRequired: true }, "Phone number required to complete registration.");
            }

            const { customer, token } = result;
            const response = ApiResponse(200, { user: customer, token }, "Google login successful.");

            response.cookies.set("token", token!, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 1, // 1 day
            });

            return response;
        } catch (error: any) {
            return ApiResponse(500, null, error.message || "An error occurred during Google sign-in.");
        }
    }
}
