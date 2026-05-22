import { VariantService } from "./variant.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { getUrls } from "../../utils/geturl";
import { Inventory } from "../inventory/Inventory.model";
import { parseVariantFormData, rollbackVariantUploads } from "./variant.form";

const formatVariant = async (variant: any) => {
    if (!variant) return null;
    const variantObj = variant.toObject ? variant.toObject() : variant;
    if (variantObj.images) {
        variantObj.images = variantObj.images.map((img: string) => getUrls.getUrl(img) || img);
    }
    // Resolve stock level dynamically from Inventory collection
    const inventory = await Inventory.findOne({ variantId: variantObj._id });
    variantObj.stock = inventory ? inventory.availableQty : 0;
    variantObj.lowStockLimit = inventory ? inventory.lowStockLimit : 10;
    return variantObj;
};

export class VariantController {
    static async getAll(query: any = {}) {
        try {
            const variants = await VariantService.getAll(query);
            const formatted = await Promise.all(variants.map(v => formatVariant(v)));
            return ApiResponse(200, formatted, "Variants fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getById(id: string) {
        try {
            const variant = await VariantService.getById(id);
            if (!variant) return ApiResponse(404, null, "Variant not found.");
            const formatted = await formatVariant(variant);
            return ApiResponse(200, formatted, "Variant fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async create(productId: string, formData: FormData) {
        let uploadedUrls: string[] = [];

        try {
            const parsed = await parseVariantFormData(formData);
            uploadedUrls = parsed.uploadedUrls;

            const variant = await VariantService.create(productId, parsed.data);
            const formatted = await formatVariant(variant);
            return ApiResponse(201, formatted, "Product variant and inventory created successfully.");
        } catch (error: unknown) {
            await rollbackVariantUploads(uploadedUrls);
            const message = error instanceof Error ? error.message : "Failed to create variant.";
            const status = message.includes("required") || message.includes("Invalid") ? 400 : 500;
            return ApiResponse(status, null, message);
        }
    }

    static async update(variantId: string, formData: FormData) {
        let uploadedUrls: string[] = [];

        try {
            const parsed = await parseVariantFormData(formData);
            uploadedUrls = parsed.uploadedUrls;

            const variant = await VariantService.update(variantId, parsed.data);
            if (!variant) {
                await rollbackVariantUploads(uploadedUrls);
                return ApiResponse(404, null, "Variant not found.");
            }
            const formatted = await formatVariant(variant);
            return ApiResponse(200, formatted, "Variant updated successfully.");
        } catch (error: unknown) {
            await rollbackVariantUploads(uploadedUrls);
            const message = error instanceof Error ? error.message : "Failed to update variant.";
            const status = message.includes("required") || message.includes("Invalid") ? 400 : 500;
            return ApiResponse(status, null, message);
        }
    }

    static async delete(variantId: string) {
        try {
            const success = await VariantService.delete(variantId);
            if (!success) return ApiResponse(404, null, "Variant not found.");
            return ApiResponse(200, null, "Variant deleted successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
