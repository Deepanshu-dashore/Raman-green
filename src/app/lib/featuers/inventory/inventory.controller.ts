import { InventoryService } from "./inventory.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { getUrls } from "../../utils/geturl";

const formatInventoryItem = (item: any) => {
    const obj = item?.toObject ? item.toObject() : { ...item };
    if (obj.variantId?.images?.length) {
        obj.variantId.images = obj.variantId.images.map(
            (img: string) => getUrls.getUrl(img) || img
        );
    }
    return obj;
};

export class InventoryController {
    /**
     * Get all inventories
     */
    static async getAll() {
        try {
            const data = await InventoryService.getAllInventory();
            const formatted = data.map(formatInventoryItem);
            return ApiResponse(200, formatted, "Inventory list fetched successfully.");
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

    /**
     * Get inventory item by ID
     */
    static async getById(id: string) {
        try {
            const data = await InventoryService.getInventoryById(id);
            if (!data) {
                return ApiResponse(404, null, "Inventory item not found.");
            }
            return ApiResponse(200, data, "Inventory item fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    /**
     * Create a new inventory item
     */
    static async create(bodyData: any) {
        try {
            const created = await InventoryService.createInventory(bodyData);
            return ApiResponse(201, created, "Inventory item created successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    /**
     * Delete an inventory item by ID
     */
    static async delete(id: string) {
        try {
            const deleted = await InventoryService.deleteInventory(id);
            if (!deleted) {
                return ApiResponse(404, null, "Inventory item not found.");
            }
            return ApiResponse(200, null, "Inventory item deleted successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
