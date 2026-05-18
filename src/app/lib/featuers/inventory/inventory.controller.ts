import { InventoryService } from "./inventory.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class InventoryController {
    /**
     * Get all inventories
     */
    static async getAll() {
        try {
            const data = await InventoryService.getAllInventory();
            return ApiResponse(200, data, "Inventory list fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    /**
     * Update warehouse inventory item
     */
    static async update(id: string, bodyData: any) {
        try {
            const updated = await InventoryService.updateInventory(id, bodyData);
            if (!updated) {
                return ApiResponse(404, null, "Inventory item not found.");
            }
            return ApiResponse(200, updated, "Inventory item updated successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
