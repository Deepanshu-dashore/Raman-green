import { ProductService } from "./product.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { getUrls } from "../../utils/geturl";
import { Inventory } from "../inventory/Inventory.model";

const formatProduct = async (product: any) => {
    if (!product) return null;
    const productObj = product.toObject ? product.toObject() : product;
    if (productObj.variants && Array.isArray(productObj.variants)) {
        productObj.variants = await Promise.all(productObj.variants.map(async (v: any) => {
            if (v && typeof v === 'object') {
                if (v.images) {
                    v.images = v.images.map((img: string) => getUrls.getUrl(img) || img);
                }
                // Resolve stock level dynamically from Inventory collection
                const inventory = await Inventory.findOne({ variantId: v._id || v });
                v.stock = inventory ? inventory.availableQty : 0;
                v.lowStockLimit = inventory ? inventory.lowStockLimit : 10;
            }
            return v;
        }));
    }
    return productObj;
};

export class ProductController {
    static async create(reqData: any) {
        try {
            const product = await ProductService.createProduct(reqData);
            const formatted = await formatProduct(product);
            return ApiResponse(201, formatted, "Product created successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getAll(query: any = {}) {
        try {
            const products = await ProductService.getAllProducts(query);
            const formattedProducts = await Promise.all(products.map(product => formatProduct(product)));
            return ApiResponse(200, formattedProducts, "Products fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getBySlug(slug: string) {
        try {
            const product = await ProductService.getProductBySlug(slug);
            if (!product) return ApiResponse(404, null, "Product not found.");
            const formatted = await formatProduct(product);
            return ApiResponse(200, formatted, "Product fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async update(id: string, reqData: any) {
        try {
            const product = await ProductService.updateProduct(id, reqData);
            if (!product) return ApiResponse(404, null, "Product not found.");
            const formatted = await formatProduct(product);
            return ApiResponse(200, formatted, "Product updated successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async delete(id: string) {
        try {
            const product = await ProductService.deleteProduct(id);
            if (!product) return ApiResponse(404, null, "Product not found.");
            return ApiResponse(200, null, "Product deleted successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async addVariant(productId: string, reqData: any) {
        try {
            const variant = await ProductService.addVariantToProduct(productId, reqData);
            const variantObj = variant.toObject ? variant.toObject() : variant;
            if (variantObj.images) {
                variantObj.images = variantObj.images.map((img: string) => getUrls.getUrl(img) || img);
            }
            // Resolve stock dynamically
            const inventory = await Inventory.findOne({ variantId: variantObj._id });
            variantObj.stock = inventory ? inventory.availableQty : 0;
            variantObj.lowStockLimit = inventory ? inventory.lowStockLimit : 10;

            return ApiResponse(201, variantObj, "Product variant and inventory created successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async updateVariant(variantId: string, reqData: any) {
        try {
            const variant = await ProductService.updateVariant(variantId, reqData);
            if (!variant) return ApiResponse(404, null, "Variant not found.");
            const variantObj = variant.toObject ? variant.toObject() : variant;
            if (variantObj.images) {
                variantObj.images = variantObj.images.map((img: string) => getUrls.getUrl(img) || img);
            }
            // Resolve stock dynamically
            const inventory = await Inventory.findOne({ variantId: variantObj._id });
            variantObj.stock = inventory ? inventory.availableQty : 0;
            variantObj.lowStockLimit = inventory ? inventory.lowStockLimit : 10;

            return ApiResponse(200, variantObj, "Variant updated successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async deleteVariant(variantId: string) {
        try {
            const success = await ProductService.deleteVariant(variantId);
            if (!success) return ApiResponse(404, null, "Variant not found.");
            return ApiResponse(200, null, "Variant deleted successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
