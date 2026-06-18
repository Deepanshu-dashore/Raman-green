import { UserService } from "./user.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { JWTHelper } from "../../utils/JWTHelper";
import { sanitizeNoSql } from "../../utils/sanitize";

export class UserController {
    /**
     * Handle admin registration
     * @param reqData - Request body containing user details
     */
    static async registerAdmin(reqData: any) {
        try {
            const sanitizedData = sanitizeNoSql(reqData);
            const { name, phone, email, password } = sanitizedData;

            if (!name || !phone || !password) {
                return ApiResponse(400, null, "Name, phone, and password are required.");
            }

            const newUser = await UserService.registerAdmin({ name, phone, email, password });

            return ApiResponse(201, newUser, "Admin registered successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message || "An error occurred during registration.");
        }
    }

    /**
     * Handle customer registration
     * @param reqData - Request body containing user details
     */
    static async registerCustomer(reqData: any) {
        try {
            const sanitizedData = sanitizeNoSql(reqData);
            const { name, phone, email, password } = sanitizedData;

            if (!name || !phone || !password) {
                return ApiResponse(400, null, "Name, phone, and password are required.");
            }

            const newUser = await UserService.registerCustomer({ name, phone, email, password });

            const token = JWTHelper.generateToken({
                id: newUser._id,
                role: newUser.role
            });

            const userObj = newUser.toObject();
            delete userObj.password;

            const response = ApiResponse(201, { user: userObj, token }, "User registered successfully.");

            response.cookies.set("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 1, // 1 day
            });

            return response;
        } catch (error: any) {
            return ApiResponse(500, null, error.message || "An error occurred during registration.");
        }
    }

    /**
     * Handle user login
     * @param reqData - Request body containing identifier and password
     */
    static async login(reqData: any) {
        try {
            const sanitizedData = sanitizeNoSql(reqData);
            const { identifier, password } = sanitizedData;

            if (!identifier || !password) {
                return ApiResponse(400, null, "Identifier (phone/email) and password are required.");
            }

            const { user, token } = await UserService.login(identifier, password);

            const response = ApiResponse(200, { user, token }, "Login successful.");

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

    /**
     * Handle Google sign-in or registration
     * @param reqData - Request body containing Google email, name, and optional phone/googleId
     */
    static async loginGoogle(reqData: any) {
        try {
            const sanitizedData = sanitizeNoSql(reqData);
            const { email, name, phone, googleId } = sanitizedData;

            if (!email || !name) {
                return ApiResponse(400, null, "Email and name are required.");
            }

            const result = await UserService.loginGoogle({ email, name, phone, googleId });

            if (result.phoneRequired) {
                return ApiResponse(200, { phoneRequired: true }, "Phone number required to complete registration.");
            }

            const { user, token } = result;
            const response = ApiResponse(200, { user, token }, "Google login successful.");

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

    /**
     * Handle user logout
     */
    static async logout() {
        const response = ApiResponse(200, null, "Logged out successfully.");
        response.cookies.delete("token");
        return response;
    }
}