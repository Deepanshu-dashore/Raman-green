"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";

const emptyForm = {
  name: "",
  slug: "",
  parent: "",
  description: "",
};

export interface CategoryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { _id: string; name: string; parent?: unknown }[];
  defaultParent?: string;
  onSuccess: () => void;
}

export function CategoryCreateModal({
  isOpen,
  onClose,
  categories,
  defaultParent = "",
  onSuccess,
}: CategoryCreateModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...emptyForm, parent: defaultParent });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [isOpen, defaultParent]);

  const revokePreview = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const resetAndClose = () => {
    revokePreview();
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name"
        ? { slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") }
        : {}),
    }));
  };

  const setImage = useCallback((file: File) => {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setImageFile(file);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) setImage(file);
    },
    [setImage]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: submitting,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      toast.error(err?.message || "Invalid file. Use PNG/JPG/WebP under 5MB.");
    },
  });

  const removeImage = () => {
    revokePreview();
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error("Please select a category image.");
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("slug", formData.slug);
      if (formData.parent) body.append("parent", formData.parent);
      if (formData.description) body.append("description", formData.description);
      body.append("image", imageFile);

      const res = await fetch("/api/categories", {
        method: "POST",
        body,
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Category created successfully!");
        revokePreview();
        setFormData(emptyForm);
        setImageFile(null);
        setImagePreview(null);
        onSuccess();
        onClose();
      } else {
        toast.error(json.message || "Failed to create category");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const rootCategories = categories.filter((cat) => !cat.parent);

  const inputClass =
    "w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all";
  const labelClass = "block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1";

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={defaultParent ? "Add Subcategory" : "Add New Category"}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-5 items-stretch">
          <div className="flex flex-col h-full min-h-0 self-stretch">
            <label className={labelClass}>Image</label>
            {imagePreview ? (
              <div className="relative flex-1 w-full min-h-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors z-10"
                  title="Remove image"
                >
                  <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`flex flex-1 flex-col items-center justify-center w-full min-h-0 rounded-xl border-2 border-dashed cursor-pointer transition-colors outline-none ${
                  submitting
                    ? "opacity-60 pointer-events-none border-gray-200 bg-gray-50"
                    : isDragReject
                      ? "border-red-400 bg-red-50"
                      : isDragActive
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                <input {...getInputProps()} />
                <Icon
                  icon="lucide:image-plus"
                  className={`w-8 h-8 mb-1.5 ${isDragActive ? "text-green-600" : "text-gray-400"}`}
                />
                <span
                  className={`text-[11px] font-medium text-center px-2 leading-tight ${
                    isDragActive ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {isDragActive ? "Drop image here" : "Drag & drop or click to upload"}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WebP · max 5MB</span>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3 min-w-0 col-span-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  className={inputClass}
                  placeholder="e.g. Microgreens"
                />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className={inputClass}
                  placeholder="slug-url"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Parent</label>
              <select
                name="parent"
                value={formData.parent}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">None (Root)</option>
                {rootCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Description (optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Brief description…"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetAndClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
}
