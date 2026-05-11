import { Product, IProduct } from "./product.model";

export class ProductService {
    /**
     * Create a new product
     */
    static async createProduct(data: Partial<IProduct>): Promise<IProduct> {
        const product = new Product(data);
        return await product.save();
    }

    /**
     * Get all products with optional filters
     */
    static async getAllProducts(query: any = {}): Promise<IProduct[]> {
        return await Product.find(query).populate("category");
    }

    /**
     * Get product by slug
     */
    static async getProductBySlug(slug: string): Promise<IProduct | null> {
        return await Product.findOne({ slug }).populate("category");
    }

    /**
     * Get product by ID
     */
    static async getProductById(id: string): Promise<IProduct | null> {
        return await Product.findById(id).populate("category");
    }

    /**
     * Update product
     */
    static async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
        return await Product.findByIdAndUpdate(id, data, { new: true });
    }

    /**
     * Delete product
     */
    static async deleteProduct(id: string): Promise<IProduct | null> {
        return await Product.findByIdAndDelete(id);
    }
}
