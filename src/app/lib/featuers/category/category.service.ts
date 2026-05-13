import { Category, ICategory } from "./category.model";

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
        return await Category.find().populate("parent children");
    }

    /**
     * Get category by slug
     */
    static async getCategoryBySlug(slug: string): Promise<ICategory | null> {
        return await Category.findOne({ slug }).populate("parent children");
    }

    /**
     * Update category
     */
    static async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        return await Category.findByIdAndUpdate(id, data, { new: true });
    }

    /**
     * Delete category
     */
    static async deleteCategory(id: string): Promise<ICategory | null> {
        const category = await Category.findById(id);
        if (!category) return null;

        // Remove from parent's children array
        if (category.parent) {
            await Category.findByIdAndUpdate(category.parent, {
                $pull: { children: category._id }
            });
        }

        // Set children's parent to null (or handle as needed)
        if (category.children && category.children.length > 0) {
            await Category.updateMany(
                { _id: { $in: category.children } },
                { $unset: { parent: "" } }
            );
        }

        return await Category.findByIdAndDelete(id);
    }
}
