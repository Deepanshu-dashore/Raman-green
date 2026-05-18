import { ProductService } from "./product.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { getUrls } from "../../utils/geturl";

const formatProduct = (product: any) => {
    if (!product) return null;
    const productObj = product.toObject ? product.toObject() : product;
    if (productObj.variants && Array.isArray(productObj.variants)) {
        productObj.variants = productObj.variants.map((v: any) => {
            if (v && typeof v === 'object') {
                if (v.images) {
                    v.images = v.images.map((img: string) => getUrls.getUrl(img) || img);
                }
            }
            return v;
        });
    }
    return productObj;
};

export class ProductController {
    static async create(reqData: any) {
        try {
            const product = await ProductService.createProduct(reqData);
            const formatted = formatProduct(product);
            return ApiResponse(201, formatted, "Product created successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getAll(query: any = {}) {
        try {
            const products = await ProductService.getAllProducts(query);
            const formattedProducts = products.map(product => formatProduct(product));
            return ApiResponse(200, formattedProducts, "Products fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getBySlug(slug: string) {
        try {
            const product = await ProductService.getProductBySlug(slug);
            if (!product) return ApiResponse(404, null, "Product not found.");
            const formatted = formatProduct(product);
            return ApiResponse(200, formatted, "Product fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async update(id: string, reqData: any) {
        try {
            const product = await ProductService.updateProduct(id, reqData);
            if (!product) return ApiResponse(404, null, "Product not found.");
            const formatted = formatProduct(product);
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
            return ApiResponse(201, variantObj, "Product variant and inventory created successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
