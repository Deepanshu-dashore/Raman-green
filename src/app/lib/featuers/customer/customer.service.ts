import Customer from "./customer.model";
import { hashPassword, comparePasswords } from "../../security/password";
import { JWTHelper } from "../../utils/JWTHelper";

export class CustomerService {
    static async register(customerData: any) {
        const { name, phone, email, password } = customerData;

        // Check if customer already exists by phone
        const existingByPhone = await Customer.findOne({ phone });
        if (existingByPhone) {
            throw new Error("Customer with this phone number already exists.");
        }

        // Check if customer already exists by email
        if (!email) {
            throw new Error("Email address is required.");
        }
        const existingByEmail = await Customer.findOne({ email });
        if (existingByEmail) {
            throw new Error("Customer with this email already exists.");
        }

        // Hash password before saving
        const hashedPassword = await hashPassword(password);

        const newCustomer = new Customer({
            name,
            phone,
            email,
            password: hashedPassword,
            loginAt: new Date()
        });

        await newCustomer.save();
        return newCustomer;
    }

    static async login(identifier: string, password: string) {
        // Find customer by phone or email
        const customer = await Customer.findOne({
            $or: [{ phone: identifier }, { email: identifier }]
        });

        if (!customer) {
            const isEmail = identifier.includes("@");
            if (isEmail) {
                throw new Error(`Account can't be found with that email.`);
            } else {
                throw new Error(`Account can't be found with that mobile number.`);
            }
        }

        // Compare password
        const isMatch = await comparePasswords(password, customer.password);
        if (!isMatch) {
            throw new Error("Incorrect password. Please try again.");
        }

        // Update loginAt
        customer.loginAt = new Date();
        await customer.save();

        // Generate token
        const token = JWTHelper.generateToken({
            id: customer._id,
            role: 'customer'
        });

        const customerObj = customer.toObject();
        delete customerObj.password;

        return { customer: customerObj, token };
    }

    static async logout(id: string) {
        const customer = await Customer.findById(id);
        if (customer) {
            customer.logoutAt = new Date();
            await customer.save();
        }
    }

    static async loginGoogle(googleData: { 
        email: string; 
        name: string; 
        phone?: string; 
    }): Promise<{ customer?: any; token?: string; phoneRequired?: boolean }> {
        const { email, name, phone } = googleData;

        // Find customer by email
        let customer = await Customer.findOne({ email });

        if (!customer) {
            // Customer does not exist, we need to register them
            if (!phone) {
                return { phoneRequired: true };
            }

            // Check if phone number is already registered by another account
            const existingPhone = await Customer.findOne({ phone });
            if (existingPhone) {
                throw new Error("Phone number already registered with another account.");
            }

            // Generate a secure random password since schema requires one
            const randomPassword = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15);

            const newCustomer = new Customer({
                name,
                email,
                phone,
                password: randomPassword,
                loginAt: new Date()
            });

            await newCustomer.save();
            customer = newCustomer;
        } else {
            // Update loginAt
            customer.loginAt = new Date();
            await customer.save();
        }

        // Generate token
        const token = JWTHelper.generateToken({
            id: customer._id,
            role: 'customer'
        });

        const customerObj = customer.toObject();
        delete customerObj.password;

        return { customer: customerObj, token };
    }
}
