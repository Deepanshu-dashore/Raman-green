import { CategoryService } from "./category.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class CategoryController {
    static async create(reqData: any) {
        try {
            const category = await CategoryService.createCategory(reqData);
            return ApiResponse(201, category, "Category created successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getAll() {
        try {
            const categories = await CategoryService.getAllCategories();
            return ApiResponse(200, categories, "Categories fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getBySlug(slug: string) {
        try {
            const category = await CategoryService.getCategoryBySlug(slug);
            if (!category) return ApiResponse(404, null, "Category not found.");
            return ApiResponse(200, category, "Category fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async update(id: string, reqData: any) {
        try {
            const category = await CategoryService.updateCategory(id, reqData);
            if (!category) return ApiResponse(404, null, "Category not found.");
            return ApiResponse(200, category, "Category updated successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async delete(id: string) {
        try {
            const category = await CategoryService.deleteCategory(id);
            if (!category) return ApiResponse(404, null, "Category not found.");
            return ApiResponse(200, null, "Category deleted successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
