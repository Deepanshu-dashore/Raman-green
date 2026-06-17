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
     * Register a new customer user
     * @param userData - The user data (name, phone, email, password)
     * @returns {Promise<IUser>} - The newly created user
     */
    static async registerCustomer(userData: Partial<IUser>): Promise<IUser> {
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

        // Create new user with customer role
        const newUser = new User({
            ...userData,
            role: 'customer'
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

    /**
     * Login or register a user via Google auth
     * @param googleData - email, name, optional phone, googleId
     */
    static async loginGoogle(googleData: { 
        email: string; 
        name: string; 
        phone?: string; 
        googleId?: string 
    }): Promise<{ user?: any; token?: string; phoneRequired?: boolean }> {
        const { email, name, phone } = googleData;

        // Find user by email
        let user = await User.findOne({ email });

        if (!user) {
            // User does not exist, we need to register them
            if (!phone) {
                // Return flag indicating phone number is required to complete registration
                return { phoneRequired: true };
            }

            // Check if phone number is already registered by another account
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                throw new Error("Phone number already registered with another account.");
            }

            // Generate a secure random password since schema requires one
            const randomPassword = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15);

            // Create new user with customer role
            const newUser = new User({
                name,
                email,
                phone,
                role: 'customer',
                password: randomPassword
            });

            await newUser.save();
            user = newUser;
        }

        // Generate token for verified user
        const token = JWTHelper.generateToken({
            id: user._id,
            role: user.role
        });

        const userObj = user.toObject();
        delete userObj.password;

        return { user: userObj, token };
    }
}