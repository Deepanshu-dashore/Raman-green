import { CloudinaryService } from "../../services/cloudinary.service";

export type VariantImageOrderItem =
  | { type: "existing"; url: string }
  | { type: "new"; index: number };

export interface ParsedVariantForm {
  value: number;
  unit: string;
  price: number;
  stock: number;
  sku: string;
  images: string[];
  packaging: string[];
  batchNumber?: string;
  mfgDate?: Date;
  expiryDate?: Date;
  notes?: string;
}

/** Upload new files + merge with existing URLs in gallery order */
export async function parseVariantFormData(
  formData: FormData
): Promise<{ data: ParsedVariantForm; uploadedUrls: string[] }> {
  const uploadedUrls: string[] = [];

  const sku = (formData.get("sku") as string)?.trim();
  const unit = (formData.get("unit") as string)?.trim();
  const value = Number(formData.get("value"));
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  if (!sku) throw new Error("SKU is required.");
  if (!unit) throw new Error("Unit is required.");
  if (Number.isNaN(value) || value <= 0) throw new Error("Valid size/weight is required.");
  if (Number.isNaN(price) || price < 0) throw new Error("Valid price is required.");

  const newFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const orderRaw = formData.get("imageOrder") as string | null;
  let imageOrder: VariantImageOrderItem[] = [];

  if (orderRaw) {
    try {
      imageOrder = JSON.parse(orderRaw);
    } catch {
      throw new Error("Invalid image order payload.");
    }
  }

  const images: string[] = [];

  if (imageOrder.length > 0) {
    for (const item of imageOrder) {
      if (item.type === "existing") {
        images.push(item.url);
      } else if (item.type === "new") {
        const file = newFiles[item.index];
        if (!file) throw new Error("Missing image file in upload payload.");
        const url = await CloudinaryService.upload(file, "products", "image");
        if (!url) throw new Error("Failed to upload image to Cloudinary.");
        uploadedUrls.push(url);
        images.push(url);
      }
    }
  } else {
    for (const file of newFiles) {
      const url = await CloudinaryService.upload(file, "products", "image");
      if (!url) throw new Error("Failed to upload image to Cloudinary.");
      uploadedUrls.push(url);
      images.push(url);
    }
  }

  if (images.length === 0) {
    throw new Error("At least one variant image is required.");
  }

  let packaging: string[] = [];
  const packagingRaw = formData.get("packaging") as string | null;
  if (packagingRaw) {
    try {
      packaging = JSON.parse(packagingRaw);
    } catch {
      throw new Error("Invalid packaging payload.");
    }
  }

  const batchNumber = (formData.get("batchNumber") as string)?.trim() || undefined;
  const mfgDateRaw = formData.get("mfgDate") as string | null;
  const expiryDateRaw = formData.get("expiryDate") as string | null;
  const notes = (formData.get("notes") as string)?.trim() || undefined;

  return {
    data: {
      value,
      unit,
      price,
      stock: Number.isNaN(stock) ? 0 : stock,
      sku,
      images,
      packaging,
      batchNumber,
      mfgDate: mfgDateRaw ? new Date(mfgDateRaw) : undefined,
      expiryDate: expiryDateRaw ? new Date(expiryDateRaw) : undefined,
      notes,
    },
    uploadedUrls,
  };
}

export async function rollbackVariantUploads(urls: string[]) {
  await Promise.all(
    urls.map((url) => CloudinaryService.delete(url, "image").catch(() => {}))
  );
}
