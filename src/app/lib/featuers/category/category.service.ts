import { Category, ICategory } from "./category.model";

export class CategoryService {
    /**
     * Create a new category
     */
    static async createCategory(data: Partial<ICategory>): Promise<ICategory> {
        const category = new Category(data);
        return await category.save();
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
        return await Category.findByIdAndDelete(id);
    }
}
