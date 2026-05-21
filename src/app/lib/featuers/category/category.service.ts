import { Category, ICategory } from "./category.model";
import { notDeletedFilter } from "../../utils/softDelete";

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
        return await Category.findOneAndUpdate(
            { _id: id, ...notDeletedFilter },
            data,
            { new: true }
        );
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
}
