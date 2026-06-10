import mongoose from "mongoose";
import { ProductVariant, IProductVariant } from "./ProductVariants.model";
import { Product } from "../product/product.model";
import { Inventory } from "../inventory/Inventory.model";
import { InventoryHistory } from "../inventory/inventory-history.model";
import { notDeletedFilter } from "../../utils/softDelete";

export class VariantService {
    /**
     * Get all variants with optional filters
     */
    static async getAll(query: any = {}): Promise<IProductVariant[]> {
        return await ProductVariant.find({ ...query, ...notDeletedFilter })
            .populate("unit")
            .populate("packaging")
            .populate("productId");
    }

    /**
     * Get variant by ID
     */
    static async getById(id: string): Promise<IProductVariant | null> {
        return await ProductVariant.findOne({ _id: id, ...notDeletedFilter })
            .populate("unit")
            .populate("packaging")
            .populate("productId");
    }

    /**
     * Create a new variant and link it to the product, creating initial inventory
     */
    static async create(productId: string, varData: any, adminId?: string): Promise<IProductVariant> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Verify the product exists
            const product = await Product.findOne({ _id: productId, ...notDeletedFilter }).session(session);
            if (!product) {
                throw new Error("Product not found.");
            }

            // 2. Make sure SKU is unique
            const existingVariant = await ProductVariant.findOne({ sku: varData.sku, ...notDeletedFilter }).session(session);
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
                sku: varData.sku,
                usageInstructions: varData.usageInstructions
            });
            await variant.save({ session });

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
                notes: varData.notes || "Initial inventory on variant creation"
            });
            await inventory.save({ session });

            // 5. Create InventoryHistory record
            const history = new InventoryHistory({
                inventory: inventory._id,
                actionType: 'STOCK_IN',
                quantity: stockVal,
                previousStock: 0,
                newStock: stockVal,
                note: varData.notes || "Initial inventory on variant creation",
                referenceId: variant._id.toString(),
                referenceModel: 'ProductVariant',
                createdBy: adminId || null
            });
            await history.save({ session });

            // 6. Append variant reference to product (using updateOne with $push to bypass required field schema validations on other product fields)
            await Product.updateOne(
                { _id: product._id },
                { $push: { variants: variant._id } }
            ).session(session);

            await session.commitTransaction();
            session.endSession();

            // Return the variant populated
            const populatedVariant = await ProductVariant.findById(variant._id)
                .populate("unit")
                .populate("packaging");
            return populatedVariant as IProductVariant;

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    /**
     * Update standalone variant (stock is synced to Inventory)
     */
    static async update(variantId: string, varData: any): Promise<IProductVariant | null> {
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
                sku: varData.sku,
                usageInstructions: varData.usageInstructions
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
     * Soft-delete standalone variant
     */
    static async delete(variantId: string): Promise<boolean> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const variant = await ProductVariant.findOne({ _id: variantId, ...notDeletedFilter }).session(session);
            if (!variant) {
                await session.abortTransaction();
                session.endSession();
                return false;
            }

            const now = new Date();

            await ProductVariant.findByIdAndUpdate(variantId, {
                isDeleted: true,
                deletedAt: now
            }, { session });

            await Inventory.updateMany(
                { variantId },
                { $set: { availableQty: 0, notes: "Archived: variant deleted" } }
            ).session(session);

            // Crucially, pull reference from product.variants to keep product clean
            await Product.updateOne(
                { _id: variant.productId },
                { $pull: { variants: variantId } }
            ).session(session);

            await session.commitTransaction();
            session.endSession();
            return true;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}
