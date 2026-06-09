"use client";

import React from "react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";

export interface CategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any | null;
  categories: any[];
}

export function CategoryViewModal({
  isOpen,
  onClose,
  category,
  categories,
}: CategoryViewModalProps) {
  if (!category) return null;

  const subcategories = categories.filter(
    (c) => c.parent?._id === category._id || c.parent === category._id
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Category Details"
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Image Card */}
        <div className="md:col-span-1">
          <div className="aspect-square w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative shadow-sm">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-green-50 text-green-700 font-extrabold text-4xl flex items-center justify-center uppercase">
                {category.name?.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Right: Info list */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
            <span className="inline-block mt-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-mono text-gray-600">
              {category.slug}
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Hierarchy Status
            </span>
            {category.parent ? (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-semibold">Subcategory of</span>
                <span className="bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded text-xs">
                  {category.parent.name || "Parent Category"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-semibold">Root Category</span>
              </div>
            )}
          </div>

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Description
            </span>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {category.description || "No description provided."}
            </p>
          </div>

          {!category.parent && (
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Subcategories ({subcategories.length})
              </span>
              {subcategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <span
                      key={sub._id}
                      className="px-2.5 py-1.5 bg-green-50/55 border border-green-100/50 rounded-xl text-xs font-semibold text-green-700"
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No subcategories defined.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="!py-2 !px-5 !rounded-lg text-xs font-bold cursor-pointer"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}
