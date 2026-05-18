import { Product, IProduct } from "./product.model";
import { ProductVariant, IProductVariant } from "../product-variant/ProductVariants.model";
import { Inventory } from "../inventory/Inventory.model";

export class ProductService {
    /**
     * Create a new product along with optional variants and initial inventories
     */
    static async createProduct(data: any): Promise<IProduct> {
        const { variants: variantsData, ...productData } = data;

        // 1. Verify SKUs are globally unique and unique in the payload
        if (variantsData && Array.isArray(variantsData)) {
            const skus = variantsData.map((v: any) => v.sku).filter(Boolean);
            
            // Check for duplicates within the payload itself
            const uniqueSkusInPayload = new Set(skus);
            if (uniqueSkusInPayload.size !== skus.length) {
                throw new Error("Duplicate SKUs detected in the request.");
            }

            // Check database for existing SKUs
            for (const sku of skus) {
                const existingVariant = await ProductVariant.findOne({ sku });
                if (existingVariant) {
                    throw new Error(`SKU "${sku}" already exists in the database.`);
                }
            }
        }

        // 2. Create the main product
        const product = new Product(productData);
        await product.save();

        const createdVariantIds = [];

        // 3. Process variants and create inventory
        if (variantsData && Array.isArray(variantsData)) {
            for (const varData of variantsData) {
                const stockVal = Number(varData.stock) || 0;
                
                // Create ProductVariant (packaging included, stock omitted)
                const variant = new ProductVariant({
                    productId: product._id,
                    basePrice: Number(varData.price || varData.basePrice || 0),
                    discountedPrice: Number(varData.discountedPrice || 0),
                    unit: varData.unit || null,
                    packaging: varData.packaging || [],
                    size: Number(varData.size || 0),
                    weight: Number(varData.weight || varData.value || 0),
                    images: varData.images || [],
                    sku: varData.sku
                });
                await variant.save();
                createdVariantIds.push(variant._id);

                // Create Inventory record
                const today = new Date();
                const oneYearLater = new Date();
                oneYearLater.setFullYear(today.getFullYear() + 1);

                const inventory = new Inventory({
                    variantId: variant._id,
                    productId: product._id,
                    batchNumber: varData.batchNumber || `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    mfgDate: varData.mfgDate ? new Date(varData.mfgDate) : today,
                    expiryDate: varData.expiryDate ? new Date(varData.expiryDate) : oneYearLater,
                    availableQty: stockVal,
                    reservedQty: 0,
                    notes: varData.notes || "Initial inventory on variant creation"
                });
                await inventory.save();
            }
        }

        // Update product with variant references
        if (createdVariantIds.length > 0) {
            product.variants = createdVariantIds as any;
            await product.save();
        }

        // Return fully populated product
        const populatedProduct = await Product.findById(product._id)
            .populate("category")
            .populate({
                path: "variants",
                populate: [
                    { path: "unit" },
                    { path: "packaging" }
                ]
            });
        return populatedProduct as IProduct;
    }

    /**
     * Add a variant to an existing product, including initial inventory
     */
    static async addVariantToProduct(productId: string, varData: any): Promise<IProductVariant> {
        // 1. Verify the product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found.");
        }

        // 2. Make sure SKU is unique
        const existingVariant = await ProductVariant.findOne({ sku: varData.sku });
        if (existingVariant) {
            throw new Error(`SKU "${varData.sku}" already exists in the database.`);
        }

        const stockVal = Number(varData.stock) || 0;

        // 3. Create ProductVariant (packaging included, stock omitted)
        const variant = new ProductVariant({
            productId: product._id,
            basePrice: Number(varData.price || varData.basePrice || 0),
            discountedPrice: Number(varData.discountedPrice || 0),
            unit: varData.unit || null,
            packaging: varData.packaging || [],
            size: Number(varData.size || 0),
            weight: Number(varData.weight || varData.value || 0),
            images: varData.images || [],
            sku: varData.sku
        });
        await variant.save();

        // 4. Create Inventory record
        const today = new Date();
        const oneYearLater = new Date();
        oneYearLater.setFullYear(today.getFullYear() + 1);

        const inventory = new Inventory({
            variantId: variant._id,
            productId: product._id,
            batchNumber: varData.batchNumber || `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            mfgDate: varData.mfgDate ? new Date(varData.mfgDate) : today,
            expiryDate: varData.expiryDate ? new Date(varData.expiryDate) : oneYearLater,
            availableQty: stockVal,
            reservedQty: 0,
            notes: varData.notes || "Initial inventory on variant addition"
        });
        await inventory.save();

        // 5. Append variant reference to product
        product.variants.push(variant._id);
        await product.save();

        return variant;
    }

    /**
     * Get all products with optional filters
     */
    static async getAllProducts(query: any = {}): Promise<IProduct[]> {
        return await Product.find(query)
            .populate("category")
            .populate({
                path: "variants",
                populate: [
                    { path: "unit" },
                    { path: "packaging" }
                ]
            });
    }

    /**
     * Get product by slug or ID
     */
    static async getProductBySlug(slug: string): Promise<IProduct | null> {
        if (slug.match(/^[0-9a-fA-F]{24}$/)) {
            const product = await Product.findById(slug)
                .populate("category")
                .populate({
                    path: "variants",
                    populate: [
                        { path: "unit" },
                        { path: "packaging" }
                    ]
                });
            if (product) return product;
        }
        return await Product.findOne({ slug })
            .populate("category")
            .populate({
                path: "variants",
                populate: [
                    { path: "unit" },
                    { path: "packaging" }
                ]
            });
    }

    /**
     * Get product by ID
     */
    static async getProductById(id: string): Promise<IProduct | null> {
        return await Product.findById(id)
            .populate("category")
            .populate({
                path: "variants",
                populate: [
                    { path: "unit" },
                    { path: "packaging" }
                ]
            });
    }

    /**
     * Update product along with its variants and inventories
     */
    static async updateProduct(id: string, data: any): Promise<IProduct | null> {
        const { variants: variantsData, ...productData } = data;

        // 1. Update the main Product document
        const product = await Product.findByIdAndUpdate(id, productData, { new: true });
        if (!product) return null;

        // 2. Process and update/create variants if provided
        if (variantsData && Array.isArray(variantsData)) {
            const updatedVariantIds = [];

            for (const varData of variantsData) {
                const stockVal = Number(varData.stock) || 0;
                const skuStr = varData.sku;

                // Check if SKU is unique (exclude the current variant if updating)
                if (skuStr) {
                    const existingVariant = await ProductVariant.findOne({ 
                        sku: skuStr, 
                        _id: { $ne: varData._id } 
                    });
                    if (existingVariant) {
                        throw new Error(`SKU "${skuStr}" already exists on another variant.`);
                    }
                }

                let variant;

                if (varData._id && varData._id.match(/^[0-9a-fA-F]{24}$/)) {
                    // Update existing variant (stock omitted)
                    variant = await ProductVariant.findByIdAndUpdate(
                        varData._id,
                        {
                            basePrice: Number(varData.price || varData.basePrice || 0),
                            discountedPrice: Number(varData.discountedPrice || 0),
                            unit: varData.unit || null,
                            packaging: varData.packaging || [],
                            size: Number(varData.size || 0),
                            weight: Number(varData.weight || varData.value || 0),
                            images: varData.images || [],
                            sku: skuStr
                        },
                        { new: true }
                    );

                    // Sync Inventory availableQty
                    if (variant) {
                        await Inventory.findOneAndUpdate(
                            { variantId: variant._id },
                            { availableQty: stockVal }
                        );
                    }
                } else {
                    // Create a new variant (stock omitted)
                    variant = new ProductVariant({
                        productId: product._id,
                        basePrice: Number(varData.price || varData.basePrice || 0),
                        discountedPrice: Number(varData.discountedPrice || 0),
                        unit: varData.unit || null,
                        packaging: varData.packaging || [],
                        size: Number(varData.size || 0),
                        weight: Number(varData.weight || varData.value || 0),
                        images: varData.images || [],
                        sku: skuStr
                    });
                    await variant.save();

                    // Create matching inventory
                    const today = new Date();
                    const oneYearLater = new Date();
                    oneYearLater.setFullYear(today.getFullYear() + 1);

                    const inventory = new Inventory({
                        variantId: variant._id,
                        productId: product._id,
                        batchNumber: varData.batchNumber || `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        mfgDate: varData.mfgDate ? new Date(varData.mfgDate) : today,
                        expiryDate: varData.expiryDate ? new Date(varData.expiryDate) : oneYearLater,
                        availableQty: stockVal,
                        reservedQty: 0,
                        notes: varData.notes || "Initial inventory on variant creation"
                    });
                    await inventory.save();
                }

                if (variant) {
                    updatedVariantIds.push(variant._id);
                }
            }

            // Sync product variants list
            product.variants = updatedVariantIds as any;
            await product.save();
        }

        // Return fully populated updated product
        return await Product.findById(product._id)
            .populate("category")
            .populate({
                path: "variants",
                populate: [
                    { path: "unit" },
                    { path: "packaging" }
                ]
            });
    }

    /**
     * Update standalone variant (stock omitted)
     */
    static async updateVariant(variantId: string, varData: any): Promise<IProductVariant | null> {
        // 1. Verify SKU uniqueness
        if (varData.sku) {
            const existing = await ProductVariant.findOne({ 
                sku: varData.sku, 
                _id: { $ne: variantId } 
            });
            if (existing) {
                throw new Error(`SKU "${varData.sku}" already exists on another variant.`);
            }
        }

        const stockVal = Number(varData.stock) || 0;

        // 2. Perform updates (stock omitted)
        const variant = await ProductVariant.findByIdAndUpdate(
            variantId,
            {
                basePrice: Number(varData.price || varData.basePrice || 0),
                discountedPrice: Number(varData.discountedPrice || 0),
                unit: varData.unit || null,
                packaging: varData.packaging || [],
                size: Number(varData.size || 0),
                weight: Number(varData.weight || varData.value || 0),
                images: varData.images || [],
                sku: varData.sku
            },
            { new: true }
        ).populate("unit").populate("packaging");

        if (variant) {
            // Sync inventory availableQty
            await Inventory.findOneAndUpdate(
                { variantId: variant._id },
                { availableQty: stockVal }
            );
        }

        return variant;
    }

    /**
     * Delete standalone variant
     */
    static async deleteVariant(variantId: string): Promise<boolean> {
        const variant = await ProductVariant.findById(variantId);
        if (!variant) return false;

        // 1. Remove reference from Product variants array
        await Product.findByIdAndUpdate(variant.productId, {
            $pull: { variants: variantId }
        });

        // 2. Delete inventory entries
        await Inventory.deleteMany({ variantId });

        // 3. Delete variant itself
        await ProductVariant.findByIdAndDelete(variantId);
        return true;
    }

    /**
     * Delete product
     */
    static async deleteProduct(id: string): Promise<IProduct | null> {
        const product = await Product.findById(id);
        if (product) {
            // Delete all nested variants and inventories
            if (product.variants && product.variants.length > 0) {
                await Inventory.deleteMany({ productId: product._id });
                await ProductVariant.deleteMany({ productId: product._id });
            }
        }
        return await Product.findByIdAndDelete(id);
    }
}
