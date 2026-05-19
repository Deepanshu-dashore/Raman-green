import cloudinary from "../config/cloudinary.config";

export class CloudinaryService {
  /**
   * Uploads file to Cloudinary and returns the secure URL (string).
   */
  static async upload(
    file: File | any,
    folder = "default",
    resource_type: "image" | "video" | "raw" | "auto" = "image"
  ): Promise<string | null> {
    try {
      if (!file) {
        throw new Error("No file provided");
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder, resource_type, secure: true }, (error, result) => {
            if (error) reject(error);
            resolve(result);
          })
          .end(buffer);
      });

      if (result) {
        return result.secure_url; // Return the secure URL string directly
      }
      return null;
    } catch (error) {
      console.error("Error in Cloudinary upload -", error);
      return null;
    }
  }

  /**
   * Deletes an asset from Cloudinary using its secure URL (or public ID).
   */
  static async delete(fileUrl: string, resource_type: "image" | "video" | "raw" | "auto" = "image"): Promise<{ success: boolean } | null> {
    try {
      if (!fileUrl) return null;

      let publicId = "";
      const parts = fileUrl.split("upload/");
      if (parts.length > 1) {
        // Extract public ID from URL (e.g. v12345/folder/name.jpg)
        const subParts = parts[1].split("/");
        // If there is a version prefix (e.g. v12345678), remove it
        if (subParts[0].startsWith("v") && /^\d+$/.test(subParts[0].substring(1))) {
          subParts.shift();
        }
        const pathAndName = subParts.join("/");
        const dotIndex = pathAndName.lastIndexOf(".");
        publicId = dotIndex > -1 ? pathAndName.substring(0, dotIndex) : pathAndName;
      } else {
        publicId = fileUrl;
      }
      
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type,
      });
      if (result) {
        return {
          success: true,
        };
      }
      return null;
    } catch (error) {
      console.error("Error in Cloudinary delete -", error);
      return null;
    }
  }
}
