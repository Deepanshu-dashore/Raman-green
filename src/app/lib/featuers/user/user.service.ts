import User, { IUser } from "./user.model";
import { comparePasswords } from "../../security/password";
import { JWTHelper } from "../../utils/JWTHelper";

export class UserService {
    /**
     * Register a new admin user
     * @param userData - The user data (name, phone, email, password)
     * @returns {Promise<IUser>} - The newly created user
     */
    static async registerAdmin(userData: Partial<IUser>): Promise<IUser> {
        const { phone, email } = userData;

        // Check if user already exists by phone
        const existingUserByPhone = await User.findOne({ phone });
        if (existingUserByPhone) {
            throw new Error("User with this phone number already exists.");
        }

        // Check if user already exists by email if provided
        if (email) {
            const existingUserByEmail = await User.findOne({ email });
            if (existingUserByEmail) {
                throw new Error("User with this email already exists.");
            }
        }

        // Create new user with admin role
        const newUser = new User({
            ...userData,
            role: 'admin'
        });

        await newUser.save();
        return newUser;
    }

    /**
     * Login a user and return user data and token
     * @param identifier - Phone or Email
     * @param password - The plaintext password
     * @returns {Promise<{user: IUser, token: string}>} - User and JWT token
     */
    static async login(identifier: string, password: string): Promise<{ user: IUser; token: string }> {
        // Find user by phone or email
        const user = await User.findOne({
            $or: [{ phone: identifier }, { email: identifier }]
        }).select("+password"); // Need to select password for comparison

        if (!user) {
            throw new Error("Invalid phone/email or password.");
        }

        // Compare password
        const isMatch = await comparePasswords(password, user.password as string);
        if (!isMatch) {
            throw new Error("Invalid phone/email or password.");
        }

        // Generate token
        const token = JWTHelper.generateToken({
            id: user._id,
            role: user.role
        });

        // Remove password from user object before returning
        const userObj = user.toObject();
        delete userObj.password;

        return { user: userObj, token };
    }
}