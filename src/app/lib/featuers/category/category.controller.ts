import { Types } from "mongoose";
import { CategoryService } from "./category.service";
import { ICategory } from "./category.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { getUrls } from "../../utils/geturl";
import { CloudinaryService } from "../../services/cloudinary.service";

const formatCategory = (category: any) => {
    if (!category) return null;
    const obj = category.toObject ? category.toObject() : { ...category };
    if (obj.image) {
        obj.image = getUrls.getUrl(obj.image) || obj.image;
    }
    if (obj.parent?.image) {
        obj.parent.image = getUrls.getUrl(obj.parent.image) || obj.parent.image;
    }
    return obj;
};

export class CategoryController {
    static async create(formData: FormData) {
        let uploadedImageUrl: string | null = null;

        try {
            const name = (formData.get("name") as string)?.trim();
            const slug = (formData.get("slug") as string)?.trim();
            const parent = (formData.get("parent") as string)?.trim() || undefined;
            const description = (formData.get("description") as string)?.trim() || undefined;
            const imageFile = formData.get("image") as File | null;

            if (!name || !slug) {
                return ApiResponse(400, null, "Name and slug are required.");
            }

            if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
                return ApiResponse(400, null, "Category image is required.");
            }

            uploadedImageUrl = await CloudinaryService.upload(imageFile, "categories", "image");
            if (!uploadedImageUrl) {
                return ApiResponse(500, null, "Failed to upload image to Cloudinary.");
            }

            const categoryData: Partial<ICategory> = {
                name,
                slug,
                description,
                image: uploadedImageUrl,
            };
            if (parent && Types.ObjectId.isValid(parent)) {
                categoryData.parent = new Types.ObjectId(parent);
            }

            const category = await CategoryService.createCategory(categoryData);

            return ApiResponse(201, formatCategory(category), "Category created successfully.");
        } catch (error: unknown) {
            if (uploadedImageUrl) {
                await CloudinaryService.delete(uploadedImageUrl, "image").catch(() => {});
            }
            const message = error instanceof Error ? error.message : "Failed to create category.";
            return ApiResponse(500, null, message);
        }
    }

    static async getAll() {
        try {
            const categories = await CategoryService.getAllCategories();
            const formatted = categories.map((c) => formatCategory(c));
            return ApiResponse(200, formatted, "Categories fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getBySlug(slug: string) {
        try {
            const category = await CategoryService.getCategoryBySlug(slug);
            if (!category) return ApiResponse(404, null, "Category not found.");
            return ApiResponse(200, formatCategory(category), "Category fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async update(id: string, reqData: any) {
        let uploadedImageUrl: string | null = null;
        try {
            let updateData: any = {};
            let deleteImage = false;

            if (reqData && typeof reqData.get === "function") {
                // It is FormData
                const name = (reqData.get("name") as string)?.trim();
                const slug = (reqData.get("slug") as string)?.trim();
                const parent = (reqData.get("parent") as string)?.trim() || undefined;
                const description = (reqData.get("description") as string)?.trim() || undefined;
                const imageFile = reqData.get("image") as File | null;
                deleteImage = reqData.get("deleteImage") === "true";

                if (name) updateData.name = name;
                if (slug) updateData.slug = slug;
                updateData.description = description || "";

                if (parent && Types.ObjectId.isValid(parent)) {
                    updateData.parent = new Types.ObjectId(parent);
                } else {
                    updateData.parent = null;
                }

                // Handle image update/delete
                const existingCategory = await CategoryService.getCategoryBySlug(id);
                if (imageFile && imageFile instanceof File && imageFile.size > 0) {
                    uploadedImageUrl = await CloudinaryService.upload(imageFile, "categories", "image");
                    if (!uploadedImageUrl) {
                        return ApiResponse(500, null, "Failed to upload image to Cloudinary.");
                    }
                    updateData.image = uploadedImageUrl;

                    // Delete old image if it exists
                    if (existingCategory?.image) {
                        await CloudinaryService.delete(existingCategory.image, "image").catch(() => {});
                    }
                } else if (deleteImage) {
                    updateData.image = "";
                    if (existingCategory?.image) {
                        await CloudinaryService.delete(existingCategory.image, "image").catch(() => {});
                    }
                }
            } else {
                // It is JSON
                updateData = { ...reqData };
            }

            const category = await CategoryService.updateCategory(id, updateData);
            if (!category) {
                // Cleanup uploaded image on failure
                if (uploadedImageUrl) {
                    await CloudinaryService.delete(uploadedImageUrl, "image").catch(() => {});
                }
                return ApiResponse(404, null, "Category not found.");
            }
            return ApiResponse(200, formatCategory(category), "Category updated successfully.");
        } catch (error: any) {
            if (uploadedImageUrl) {
                await CloudinaryService.delete(uploadedImageUrl, "image").catch(() => {});
            }
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

    static async getTrash() {
        try {
            const categories = await CategoryService.getTrashCategories();
            const formatted = categories.map((c) => formatCategory(c));
            return ApiResponse(200, formatted, "Trash categories fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async restore(id: string) {
        try {
            const category = await CategoryService.restoreCategory(id);
            if (!category) return ApiResponse(404, null, "Category not found in trash.");
            return ApiResponse(200, formatCategory(category), "Category restored successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
