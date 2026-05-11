import { ProductService } from "./product.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class ProductController {
    static async create(reqData: any) {
        try {
            const product = await ProductService.createProduct(reqData);
            return ApiResponse(201, product, "Product created successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getAll(query: any = {}) {
        try {
            const products = await ProductService.getAllProducts(query);
            return ApiResponse(200, products, "Products fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getBySlug(slug: string) {
        try {
            const product = await ProductService.getProductBySlug(slug);
            if (!product) return ApiResponse(404, null, "Product not found.");
            return ApiResponse(200, product, "Product fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async update(id: string, reqData: any) {
        try {
            const product = await ProductService.updateProduct(id, reqData);
            if (!product) return ApiResponse(404, null, "Product not found.");
            return ApiResponse(200, product, "Product updated successfully.");
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
}
