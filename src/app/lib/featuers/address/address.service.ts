import { Address, IAddress } from "./address.model";

export class AddressService {
    /**
     * Add a new address
     */
    static async addAddress(userId: string, data: Partial<IAddress>): Promise<IAddress> {
        // If this is set as default, unset other defaults
        if (data.isDefault) {
            await Address.updateMany({ user: userId }, { isDefault: false });
        }
        
        const address = new Address({ ...data, user: userId });
        return await address.save();
    }

    /**
     * Get user's addresses
     */
    static async getAddresses(userId: string): Promise<IAddress[]> {
        return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
    }

    /**
     * Update address
     */
    static async updateAddress(userId: string, id: string, data: Partial<IAddress>): Promise<IAddress | null> {
        if (data.isDefault) {
            await Address.updateMany({ user: userId }, { isDefault: false });
        }
        return await Address.findOneAndUpdate({ _id: id, user: userId }, data, { new: true });
    }

    /**
     * Delete address
     */
    static async deleteAddress(userId: string, id: string): Promise<IAddress | null> {
        return await Address.findOneAndDelete({ _id: id, user: userId });
    }
}
