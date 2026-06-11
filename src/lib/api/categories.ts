import api, { del, get, unwrap } from "@/lib/axios";

export interface CategoryResponse {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parent?: any;
  children?: any[];
  isDeleted?: boolean;
}

export interface CategoryFormFields {
  name: string;
  slug: string;
  parent?: string;
  description?: string;
  image: File;
}

export const categoriesApi = {
  getAll: () => get<CategoryResponse[]>("/api/categories"),

  create: async (fields: CategoryFormFields) => {
    const formData = new FormData();
    formData.append("name", fields.name);
    formData.append("slug", fields.slug);
    if (fields.parent) formData.append("parent", fields.parent);
    if (fields.description) formData.append("description", fields.description);
    formData.append("image", fields.image);
    const res = await api.post("/api/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res);
  },

  delete: (id: string) => del<null>(`/api/categories/${id}`),
};
