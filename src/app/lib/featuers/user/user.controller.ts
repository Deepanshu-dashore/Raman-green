import { UserService } from "./user.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class UserController {
    /**
     * Handle admin registration
     * @param reqData - Request body containing user details
     */
    static async registerAdmin(reqData: any) {
        try {
            const { name, phone, email, password } = reqData;

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
     * Handle user login
     * @param reqData - Request body containing identifier and password
     */
    static async login(reqData: any) {
        try {
            const { identifier, password } = reqData;

            if (!identifier || !password) {
                return ApiResponse(400, null, "Identifier (phone/email) and password are required.");
            }

            const { user, token } = await UserService.login(identifier, password);

            return ApiResponse(200, { user, token }, "Login successful.");
        } catch (error: any) {
            return ApiResponse(401, null, error.message || "An error occurred during login.");
        }
    }
}