"use client";
import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmButtonText?: string;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete",
  message = "Are you sure you want to delete?",
  confirmButtonText = "Delete",
}: DeleteModalProps) => {
  if (!isOpen) return null;

  const bg = title.includes("Restore") ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";

  return (
    <div
      className="w-full mx-auto fixed inset-0 bg-black/20 z-[9999] backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200"
      role="presentation"
    >
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-700 mt-2">{message}</p>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 cursor-pointer py-2 border border-gray-300 rounded-md text-gray-800 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 cursor-pointer text-white font-semibold rounded-lg shadow transition ${bg}`}
            onClick={onConfirm}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
