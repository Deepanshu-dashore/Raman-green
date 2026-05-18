import { Inventory, IInventory } from "./Inventory.model";
import { ProductVariant } from "../product-variant/ProductVariants.model";

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
        
        if (inventory) {
            // Keep ProductVariant.stock perfectly in sync with Inventory.availableQty
            if (data.availableQty !== undefined) {
                await ProductVariant.findByIdAndUpdate(inventory.variantId, {
                    stock: Number(data.availableQty)
                });
            }
        }

        return await Inventory.findById(id)
            .populate("productId")
            .populate({
                path: "variantId",
                populate: { path: "unit" }
            });
    }
}
