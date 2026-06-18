"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile } from "@/store/authSlice";
import { postForm } from "@/lib/axios";
import { isValidEmail, isValidPhone } from "@/app/lib/utils/sanitize";

export default function ProfileSettings() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [profileImage, setProfileImage] = useState(user?.image || "/placeholder/boy.png");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, etc.).");
      return;
    }

    // Restrict size to 4MB
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image file size should not exceed 4MB.");
      return;
    }

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "customers");

    try {
      const res = await postForm<string>("/api/upload", uploadData);
      if (res.success && res.data) {
        setProfileImage(res.data);
        toast.success("Profile image uploaded. Don't forget to save changes!");
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name || !email || !phone) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        updateProfile({
          name,
          email,
          phone,
          image: profileImage,
        })
      ).unwrap();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err || "Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-playfair font-extrabold text-gray-900 leading-snug">
          Profile Settings
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Manage your personal info, change your avatar picture, and keep details updated.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload Container */}
        <div className="bg-slate-50/50 border border-gray-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center shadow-sm shrink-0">
            {uploadingImage ? (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10">
                <Icon icon="mdi:loading" className="animate-spin text-white w-6 h-6" />
              </div>
            ) : null}
            <Image
              src={profileImage}
              alt="Avatar image"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2.5 text-center sm:text-left">
            <h4 className="text-sm font-bold text-gray-800">Profile Picture</h4>
            <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
              Upload a JPG or PNG avatar image (max 4MB).
            </p>
            <div className="flex justify-center sm:justify-start gap-2">
              <label className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-charcoal text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5 select-none">
                <Icon icon="solar:camera-linear" className="w-4 h-4 text-gray-400" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              {profileImage !== "/placeholder/boy.png" && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileImage("/placeholder/boy.png");
                    toast.success("Avatar reset to default placeholder.");
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors cursor-pointer select-none inline-flex items-center gap-1.5"
                >
                  <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Input fields */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-charcoal/80 mb-2 pl-1">
              Full Name
            </label>
            <div className="relative flex items-center group">
              <Icon
                icon="solar:user-linear"
                className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
              />
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-charcoal/80 mb-2 pl-1">
              Email Address
            </label>
            <div className="relative flex items-center group">
              <Icon
                icon="solar:letter-linear"
                className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
              />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-charcoal/80 mb-2 pl-1">
              Phone Number (10 digits)
            </label>
            <div className="relative flex items-center group">
              <Icon
                icon="solar:phone-calling-linear"
                className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
              />
              <input
                type="tel"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || uploadingImage}
          className="px-6 py-3.5 bg-forest hover:bg-forest/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm select-none"
        >
          {saving ? (
            <>
              <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />
              <span>Saving changes...</span>
            </>
          ) : (
            <>
              <Icon icon="solar:check-circle-linear" className="w-4.5 h-4.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
