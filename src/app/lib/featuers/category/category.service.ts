import { Category, ICategory } from "./category.model";
import { notDeletedFilter } from "../../utils/softDelete";
import { Product } from "../product/product.model";
import { CloudinaryService } from "../../services/cloudinary.service";

export class CategoryService {
    /**
     * Create a new category
     */
    static async createCategory(data: Partial<ICategory>): Promise<ICategory> {
        const category = new Category(data);
        const savedCategory = await category.save();

        if (data.parent) {
            await Category.findByIdAndUpdate(data.parent, {
                $addToSet: { children: savedCategory._id }
            });
        }

        return savedCategory;
    }

    /**
     * Get all categories
     */
    static async getAllCategories(): Promise<ICategory[]> {
        return await Category.find(notDeletedFilter).populate("parent children");
    }

    /**
     * Get category by slug or ID
     */
    static async getCategoryBySlug(slug: string): Promise<ICategory | null> {
        if (slug.match(/^[0-9a-fA-F]{24}$/)) {
            const byId = await Category.findOne({ _id: slug, ...notDeletedFilter }).populate("parent children");
            if (byId) return byId;
        }
        return await Category.findOne({ slug, ...notDeletedFilter }).populate("parent children");
    }

    /**
     * Update category
     */
    static async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        const oldCategory = await Category.findById(id);
        if (!oldCategory) return null;

        const updatedCategory = await Category.findOneAndUpdate(
            { _id: id, ...notDeletedFilter },
            data,
            { new: true }
        );

        if (updatedCategory) {
            const oldParentId = oldCategory.parent?.toString();
            const newParentId = updatedCategory.parent?.toString();

            if (oldParentId !== newParentId) {
                if (oldParentId) {
                    await Category.findByIdAndUpdate(oldParentId, {
                        $pull: { children: updatedCategory._id }
                    });
                }
                if (newParentId) {
                    await Category.findByIdAndUpdate(newParentId, {
                        $addToSet: { children: updatedCategory._id }
                    });
                }
            }
        }

        return updatedCategory;
    }

    /**
     * Soft-delete category
     */
    static async deleteCategory(id: string): Promise<ICategory | null> {
        const category = await Category.findOne({ _id: id, ...notDeletedFilter });
        if (!category) return null;

        const now = new Date();

        if (category.parent) {
            await Category.findByIdAndUpdate(category.parent, {
                $pull: { children: category._id }
            });
        }

        if (category.children && category.children.length > 0) {
            await Category.updateMany(
                { _id: { $in: category.children } },
                { $unset: { parent: "" } }
            );
        }

        category.isDeleted = true;
        category.deletedAt = now;
        await category.save();

        return category;
    }

    /**
     * Get all soft-deleted categories
     */
    static async getTrashCategories(): Promise<ICategory[]> {
        return await Category.find({ isDeleted: true }).populate("parent children");
    }

    /**
     * Restore a soft-deleted category
     */
    static async restoreCategory(id: string): Promise<ICategory | null> {
        const category = await Category.findOne({ _id: id, isDeleted: true });
        if (!category) return null;

        category.isDeleted = false;
        category.deletedAt = null;
        await category.save();

        if (category.parent) {
            await Category.findByIdAndUpdate(category.parent, {
                $addToSet: { children: category._id }
            });
        }

        return category;
    }

    /**
     * Permanently delete a category and its Cloudinary image if no products are associated
     */
    static async deleteCategoryPermanent(id: string): Promise<ICategory | null> {
        const category = await Category.findById(id);
        if (!category) return null;

        // Check if there are any products associated with this category
        const hasProducts = await Product.findOne({ category: id });
        if (hasProducts) {
            throw new Error("Cannot delete category as it has associated products.");
        }

        // Clean up parent/children relationships just in case they exist
        if (category.parent) {
            await Category.findByIdAndUpdate(category.parent, {
                $pull: { children: category._id }
            });
        }

        if (category.children && category.children.length > 0) {
            await Category.updateMany(
                { _id: { $in: category.children } },
                { $unset: { parent: "" } }
            );
        }

        // Delete image from Cloudinary
        if (category.image) {
            try {
                await CloudinaryService.delete(category.image, "image");
            } catch (err) {
                console.error(`Failed to delete Cloudinary image: ${category.image}`, err);
            }
        }

        // Delete from database
        await Category.deleteOne({ _id: id });

        return category;
    }
}
