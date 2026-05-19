import { ProductVariant, IProductVariant } from "./ProductVariants.model";
import { Product } from "../product/product.model";
import { Inventory } from "../inventory/Inventory.model";

export class VariantService {
    /**
     * Get all variants with optional filters
     */
    static async getAll(query: any = {}): Promise<IProductVariant[]> {
        return await ProductVariant.find(query)
            .populate("unit")
            .populate("packaging")
            .populate("productId");
    }

    /**
     * Get variant by ID
     */
    static async getById(id: string): Promise<IProductVariant | null> {
        return await ProductVariant.findById(id)
            .populate("unit")
            .populate("packaging")
            .populate("productId");
    }

    /**
     * Create a new variant and link it to the product, creating initial inventory
     */
    static async create(productId: string, varData: any): Promise<IProductVariant> {
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
            notes: varData.notes || "Initial inventory on variant creation"
        });
        await inventory.save();

        // 5. Append variant reference to product
        product.variants.push(variant._id);
        await product.save();

        // Return the variant populated
        const populatedVariant = await ProductVariant.findById(variant._id)
            .populate("unit")
            .populate("packaging");
        return populatedVariant as IProductVariant;
    }

    /**
     * Update standalone variant (stock is synced to Inventory)
     */
    static async update(variantId: string, varData: any): Promise<IProductVariant | null> {
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
     * Delete standalone variant and its inventory
     */
    static async delete(variantId: string): Promise<boolean> {
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
}
