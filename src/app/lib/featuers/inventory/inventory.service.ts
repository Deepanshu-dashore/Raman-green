import { Inventory, ProductVariant, Product, Unit } from "@/app/lib/db/index.model";
import { IInventory } from "./Inventory.model";


export class InventoryService {
    /**
     * Get all inventory items with deep populated products and variants
     */
    static async getAllInventory(): Promise<IInventory[]> {
        return await Inventory.find({})
            .populate("productId")
            .populate({
                path: "variantId",
                populate: { path: "unit" }
            })
            .sort({ updatedAt: -1 });
    }

    /**
     * Get inventory item by ID
     */
    static async getInventoryById(id: string): Promise<IInventory | null> {
        return await Inventory.findById(id)
            .populate("productId")
            .populate({
                path: "variantId",
                populate: { path: "unit" }
            });
    }

    /**
     * Update an inventory item and automatically sync stock quantity back to ProductVariant
     */
    static async updateInventory(id: string, data: Partial<IInventory>): Promise<IInventory | null> {
        const inventory = await Inventory.findByIdAndUpdate(id, data, { new: true });

        return await Inventory.findById(id)
            .populate("productId")
            .populate({
                path: "variantId",
                populate: { path: "unit" }
            });
    }

    /**
     * Create a new inventory record
     */
    static async createInventory(data: Partial<IInventory>): Promise<IInventory> {
        const inventory = new Inventory(data);
        await inventory.save();
        const populated = await Inventory.findById(inventory._id)
            .populate("productId")
            .populate({
                path: "variantId",
                populate: { path: "unit" }
            });
        return populated!;
    }

    /**
     * Delete an inventory record by ID
     */
    static async deleteInventory(id: string): Promise<IInventory | null> {
        return await Inventory.findByIdAndDelete(id);
    }
}

