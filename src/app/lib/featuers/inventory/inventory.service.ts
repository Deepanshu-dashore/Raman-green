import { Inventory, ProductVariant, Product, Unit } from "@/app/lib/db/index.model";
import { IInventory } from "./Inventory.model";
import { InventoryHistory } from "./inventory-history.model";


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
     * Update an inventory item and push history with createdBy tracking
     */
    static async updateInventory(id: string, data: Partial<IInventory>, adminId?: string): Promise<IInventory | null> {
        const oldInventory = await Inventory.findById(id);
        if (!oldInventory) return null;

        const previousStock = oldInventory.availableQty;
        const newStock = data.availableQty !== undefined ? Number(data.availableQty) : previousStock;

        const inventory = await Inventory.findByIdAndUpdate(id, data, { new: true });

        if (inventory && data.availableQty !== undefined && previousStock !== newStock) {
            try {
                await InventoryHistory.create({
                    inventory: inventory._id,
                    actionType: 'MANUAL_UPDATE',
                    quantity: Math.abs(newStock - previousStock),
                    previousStock,
                    newStock,
                    note: data.notes || "Manual inventory stock update",
                    referenceId: inventory.variantId.toString(),
                    referenceModel: 'ManualUpdate',
                    createdBy: adminId || undefined
                });
            } catch (err) {
                console.error("Failed to create inventory history on update:", err);
            }
        }

        return await Inventory.findById(id)
            .populate("productId")
            .populate({
                path: "variantId",
                populate: { path: "unit" }
            });
    }

    /**
     * Create a new inventory record and push STOCK_IN history
     */
    static async createInventory(data: Partial<IInventory> & { inventoryId?: string }, adminId?: string): Promise<IInventory> {
        let inventory;

        if (data.inventoryId) {
            inventory = await Inventory.findById(data.inventoryId);
        } else {
            // Find by matching variantId and batchNumber (trimmed)
            inventory = await Inventory.findOne({
                variantId: data.variantId,
                batchNumber: data.batchNumber?.trim()
            });
        }

        if (inventory) {
            const previousStock = inventory.availableQty;
            const newStock = previousStock + Number(data.availableQty || 0);

            inventory.availableQty = newStock;
            if (data.notes) {
                inventory.notes = data.notes;
            }
            if (data.mfgDate) inventory.mfgDate = data.mfgDate;
            if (data.expiryDate) inventory.expiryDate = data.expiryDate;
            if (data.lowStockLimit !== undefined) inventory.lowStockLimit = data.lowStockLimit;

            await inventory.save();

            // Push STOCK_IN history for updated inventory batch
            try {
                await InventoryHistory.create({
                    inventory: inventory._id,
                    actionType: 'STOCK_IN',
                    quantity: Number(data.availableQty || 0),
                    previousStock,
                    newStock,
                    note: data.notes || "Stock added to existing batch",
                    referenceId: inventory._id.toString(), // Store the inventory ID here as reference
                    referenceModel: 'StockIn',
                    createdBy: adminId || undefined
                });
            } catch (err) {
                console.error("Failed to create inventory history on update:", err);
            }
        } else {
            // Create a new inventory record
            inventory = new Inventory({
                variantId: data.variantId,
                productId: data.productId,
                batchNumber: data.batchNumber?.trim(),
                mfgDate: data.mfgDate,
                expiryDate: data.expiryDate,
                availableQty: data.availableQty || 0,
                reservedQty: data.reservedQty || 0,
                lowStockLimit: data.lowStockLimit !== undefined ? data.lowStockLimit : 10,
                notes: data.notes
            });
            await inventory.save();

            // Push STOCK_IN history for newly created inventory
            try {
                await InventoryHistory.create({
                    inventory: inventory._id,
                    actionType: 'STOCK_IN',
                    quantity: inventory.availableQty,
                    previousStock: 0,
                    newStock: inventory.availableQty,
                    note: data.notes || "Stock added via inventory creation",
                    referenceId: inventory._id.toString(), // Store the inventory ID here as reference
                    referenceModel: 'StockIn',
                    createdBy: adminId || undefined
                });
            } catch (err) {
                console.error("Failed to create inventory history on creation:", err);
            }
        }

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

    /**
     * Get inventory history records for a specific inventory item
     */
    static async getHistoryByInventoryId(inventoryId: string): Promise<any[]> {
        return await InventoryHistory.find({ inventory: inventoryId })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
    }
}
