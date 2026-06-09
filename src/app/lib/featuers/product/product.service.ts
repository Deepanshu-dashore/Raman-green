import { Product, IProduct } from "./product.model";
import { ProductVariant, IProductVariant } from "../product-variant/ProductVariants.model";
import { Inventory } from "../inventory/Inventory.model";
import { notDeletedFilter, variantPopulate } from "../../utils/softDelete";
import { CloudinaryService } from "../../services/cloudinary.service";

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
                const existingVariant = await ProductVariant.findOne({ sku, ...notDeletedFilter });
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
                const lowStockLimit = Number.isNaN(Number(varData.lowStockLimit)) ? 10 : Number(varData.lowStockLimit);
                
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
                    imageOrder: varData.imageOrder || [],
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
                    lowStockLimit,
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
            .populate("category certificates cultivation_city")
            .populate(variantPopulate);
        return populatedProduct as IProduct;
    }

    /**
     * Add a variant to an existing product, including initial inventory
     */
    static async addVariantToProduct(productId: string, varData: any): Promise<IProductVariant> {
        // 1. Verify the product exists
        const product = await Product.findOne({ _id: productId, ...notDeletedFilter });
        if (!product) {
            throw new Error("Product not found.");
        }

        // 2. Make sure SKU is unique
        const existingVariant = await ProductVariant.findOne({ sku: varData.sku, ...notDeletedFilter });
        if (existingVariant) {
            throw new Error(`SKU "${varData.sku}" already exists in the database.`);
        }

        const stockVal = Number(varData.stock) || 0;
        const lowStockLimit = Number.isNaN(Number(varData.lowStockLimit)) ? 10 : Number(varData.lowStockLimit);

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
            imageOrder: varData.imageOrder || [],
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
            lowStockLimit,
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
        return await Product.find({ ...query, ...notDeletedFilter })
            .populate("category certificates cultivation_city")
            .populate(variantPopulate);
    }

    /**
     * Get product by slug or ID
     */
    static async getProductBySlug(slug: string): Promise<IProduct | null> {
        if (slug.match(/^[0-9a-fA-F]{24}$/)) {
            const product = await Product.findOne({ _id: slug, ...notDeletedFilter })
                .populate("category certificates cultivation_city")
                .populate(variantPopulate);
            if (product) return product;
        }
        return await Product.findOne({ slug, ...notDeletedFilter })
            .populate("category certificates cultivation_city")
            .populate(variantPopulate);
    }

    /**
     * Get product by ID
     */
    static async getProductById(id: string): Promise<IProduct | null> {
        return await Product.findOne({ _id: id, ...notDeletedFilter })
            .populate("category certificates cultivation_city")
            .populate(variantPopulate);
    }

    /**
     * Update product along with its variants and inventories
     */
    static async updateProduct(id: string, data: any): Promise<IProduct | null> {
        const { variants: variantsData, ...productData } = data;

        // 1. Update the main Product document
        const product = await Product.findOneAndUpdate(
            { _id: id, ...notDeletedFilter },
            productData,
            { new: true }
        );
        if (!product) return null;

        // 2. Process and update/create variants if provided
        if (variantsData && Array.isArray(variantsData)) {
            const updatedVariantIds = [];

            for (const varData of variantsData) {
                const stockVal = Number(varData.stock) || 0;
                const lowStockLimit = Number.isNaN(Number(varData.lowStockLimit)) ? 10 : Number(varData.lowStockLimit);
                const skuStr = varData.sku;

                // Check if SKU is unique (exclude the current variant if updating)
                if (skuStr) {
                    const existingVariant = await ProductVariant.findOne({ 
                        sku: skuStr, 
                        _id: { $ne: varData._id },
                        ...notDeletedFilter
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
                            imageOrder: varData.imageOrder || [],
                            sku: skuStr
                        },
                        { new: true }
                    );

                    // Sync Inventory availableQty
                    if (variant) {
                        await Inventory.findOneAndUpdate(
                            { variantId: variant._id },
                            { availableQty: stockVal, lowStockLimit }
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
                        imageOrder: varData.imageOrder || [],
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
                        lowStockLimit,
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
            .populate("category certificates cultivation_city")
            .populate(variantPopulate);
    }

    /**
     * Update standalone variant (stock omitted)
     */
    static async updateVariant(variantId: string, varData: any): Promise<IProductVariant | null> {
        // 1. Verify SKU uniqueness
        if (varData.sku) {
            const existing = await ProductVariant.findOne({ 
                sku: varData.sku, 
                _id: { $ne: variantId },
                ...notDeletedFilter
            });
            if (existing) {
                throw new Error(`SKU "${varData.sku}" already exists on another variant.`);
            }
        }

        const stockVal = Number(varData.stock) || 0;
        const lowStockLimit = Number.isNaN(Number(varData.lowStockLimit)) ? 10 : Number(varData.lowStockLimit);

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
                imageOrder: varData.imageOrder || [],
                sku: varData.sku
            },
            { new: true }
        ).populate("unit").populate("packaging");

        if (variant) {
            // Sync inventory availableQty
            await Inventory.findOneAndUpdate(
                { variantId: variant._id },
                { availableQty: stockVal, lowStockLimit }
            );
        }

        return variant;
    }

    /**
     * Soft-delete standalone variant and delete its Cloudinary images
     */
    static async deleteVariant(variantId: string): Promise<boolean> {
        const variant = await ProductVariant.findOne({ _id: variantId, ...notDeletedFilter });
        if (!variant) return false;

        const now = new Date();

        // 1. Delete variant images from Cloudinary
        const imageUrls = variant.images || [];
        for (const url of imageUrls) {
            if (url) {
                try {
                    await CloudinaryService.delete(url, "image");
                } catch (err) {
                    console.error(`Failed to delete Cloudinary image: ${url}`, err);
                }
            }
        }

        // 2. Soft-delete the variant record
        await ProductVariant.findByIdAndUpdate(variantId, {
            isDeleted: true,
            deletedAt: now
        });

        // 3. Delete its inventory records
        await Inventory.deleteMany({ variantId });

        return true;
    }

    /**
     * Permanently delete product, all its variants, and their Cloudinary images if no inventory exists
     */
    static async deleteProduct(id: string): Promise<IProduct | null> {
        const product = await Product.findOne({ _id: id });
        if (!product) return null;

        // 1. Confirm product does not have any inventory entry
        const hasInventory = await Inventory.findOne({ productId: product._id });
        if (hasInventory) {
            throw new Error("Cannot delete product as it has associated inventory records.");
        }

        // 2. Fetch all associated variants (including soft-deleted ones)
        const variants = await ProductVariant.find({ productId: product._id });

        // 3. Delete all variant images from Cloudinary
        const imageUrls = variants.flatMap((v: any) => v.images || []);
        for (const url of imageUrls) {
            if (url) {
                try {
                    await CloudinaryService.delete(url, "image");
                } catch (err) {
                    console.error(`Failed to delete Cloudinary image: ${url}`, err);
                }
            }
        }

        // 4. Permanently delete all associated variants
        await ProductVariant.deleteMany({ productId: product._id });

        // 5. Permanently delete the product itself
        await Product.deleteOne({ _id: product._id });

        return product;
    }

    /**
     * Get all soft-deleted products (trash)
     */
    static async getTrashProducts(): Promise<IProduct[]> {
        return await Product.find({ isDeleted: true })
            .populate("category certificates cultivation_city")
            .populate({
                path: "variants",
                match: { isDeleted: true },
                populate: [
                    { path: "unit" },
                    { path: "packaging" }
                ]
            });
    }

    /**
     * Soft-delete product and all its variants (cascading)
     */
    static async softDeleteProduct(id: string): Promise<IProduct | null> {
        const product = await Product.findOne({ _id: id, ...notDeletedFilter });
        if (!product) return null;

        const now = new Date();

        // 1. Soft-delete all associated variants
        await ProductVariant.updateMany(
            { productId: product._id, ...notDeletedFilter },
            { $set: { isDeleted: true, deletedAt: now } }
        );

        // 2. Soft-delete the product itself
        product.isDeleted = true;
        product.deletedAt = now;
        product.isPublished = false;
        await product.save();

        return product;
    }

    /**
     * Restore soft-deleted product and all its variants (cascading)
     */
    static async restoreProduct(id: string): Promise<IProduct | null> {
        const product = await Product.findOne({ _id: id, isDeleted: true });
        if (!product) return null;

        const now = new Date();

        // 1. Restore all associated variants that were soft-deleted
        await ProductVariant.updateMany(
            { productId: product._id, isDeleted: true },
            { $set: { isDeleted: false, deletedAt: null } }
        );

        // 2. Restore the product itself
        product.isDeleted = false;
        product.deletedAt = null;
        await product.save();

        return product;
    }
}
