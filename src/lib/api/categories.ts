import api, { del, get, unwrap } from "@/lib/axios";

export interface CategoryFormFields {
  name: string;
  slug: string;
  parent?: string;
  description?: string;
  image: File;
}

export const categoriesApi = {
  getAll: () => get<unknown[]>("/api/categories"),

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
