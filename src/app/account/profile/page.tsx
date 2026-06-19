"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile, removeProfileImage } from "@/store/authSlice";
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

  // Cropper specific state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });

  if (!user) return null;

  // Calculate layout parameters in the component body
  const containerSize = 320;
  const scaleX = imgNaturalSize.width > 0 ? containerSize / imgNaturalSize.width : 1;
  const scaleY = imgNaturalSize.height > 0 ? containerSize / imgNaturalSize.height : 1;
  const baseScale = Math.max(scaleX, scaleY);
  const baseWidth = imgNaturalSize.width > 0 ? imgNaturalSize.width * baseScale : containerSize;
  const baseHeight = imgNaturalSize.height > 0 ? imgNaturalSize.height * baseScale : containerSize;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const getBounds = () => {
    const cropSize = 220;
    const { width, height } = imgNaturalSize;
    if (width === 0 || height === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const halfCrop = cropSize / 2;
    const halfWidth = (baseWidth * zoom) / 2;
    const halfHeight = (baseHeight * zoom) / 2;

    return {
      minX: halfCrop - halfWidth,
      maxX: halfWidth - halfCrop,
      minY: halfCrop - halfHeight,
      maxY: halfHeight - halfCrop,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const { minX, maxX, minY, maxY } = getBounds();
    setOffset({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    const { minX, maxX, minY, maxY } = getBounds();
    setOffset({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    const cropSize = 220;
    const { width, height } = imgNaturalSize;
    if (width === 0 || height === 0) return;

    const halfCrop = cropSize / 2;
    const halfWidth = (baseWidth * newZoom) / 2;
    const halfHeight = (baseHeight * newZoom) / 2;

    const minX = halfCrop - halfWidth;
    const maxX = halfWidth - halfCrop;
    const minY = halfCrop - halfHeight;
    const maxY = halfHeight - halfCrop;

    setOffset((prev) => ({
      x: Math.max(minX, Math.min(maxX, prev.x)),
      y: Math.max(minY, Math.min(maxY, prev.y)),
    }));
  };

  const handleCropConfirm = async () => {
    if (!cropImageSrc) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = cropImageSrc;

    img.onload = async () => {
      const cropSize = 220;
      const halfWidth = (baseWidth * zoom) / 2;
      const halfHeight = (baseHeight * zoom) / 2;

      const cropFrameX = (containerSize - cropSize) / 2;
      const cropFrameY = (containerSize - cropSize) / 2;

      const imgX = (containerSize / 2) - halfWidth + offset.x;
      const imgY = (containerSize / 2) - halfHeight + offset.y;

      const srcX = (cropFrameX - imgX) / (baseScale * zoom);
      const srcY = (cropFrameY - imgY) / (baseScale * zoom);
      const srcW = cropSize / (baseScale * zoom);
      const srcH = cropSize / (baseScale * zoom);

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 400, 400);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate cropped image.");
          return;
        }

        setIsCropperOpen(false);
        setUploadingImage(true);

        const file = new File([blob], "cropped-profile.jpg", { type: "image/jpeg" });
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("folder", "customers");

        try {
          const res = await postForm<string>("/api/upload", uploadData);
          if (res.success && res.data) {
            setProfileImage(res.data);
            toast.success("Profile image cropped and uploaded. Remember to Save Changes!");
          } else {
            toast.error("Failed to upload cropped image.");
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to upload cropped image.");
        } finally {
          setUploadingImage(false);
        }
      }, "image/jpeg", 0.95);
    };
  };

  const handleRemovePhoto = async () => {
    const confirm = window.confirm("Are you sure you want to remove your profile picture?");
    if (!confirm) return;

    try {
      setUploadingImage(true);
      await dispatch(removeProfileImage()).unwrap();
      setProfileImage("/placeholder/boy.png");
      toast.success("Profile photo removed successfully.");
    } catch (err: any) {
      toast.error(err || "Failed to remove profile photo.");
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
              {profileImage && profileImage !== "/placeholder/boy.png" && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors cursor-pointer select-none inline-flex items-center gap-1.5"
                >
                  <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
                  Remove Photo
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

      {/* Cropper Modal */}
      {isCropperOpen && cropImageSrc && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col font-inter animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-extrabold text-forest uppercase tracking-wider">Crop Profile Photo</span>
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
              </button>
            </div>

            {/* Viewport Area */}
            <div className="p-6 flex flex-col items-center gap-6">
              {/* Box */}
              <div 
                className="relative w-[320px] h-[320px] bg-slate-900 border border-gray-100 rounded-xl overflow-hidden cursor-move select-none shadow-inner"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Image */}
                <img
                  src={cropImageSrc}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  style={{
                    width: `${baseWidth}px`,
                    height: `${baseHeight}px`,
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: isDragging ? "none" : "transform 0.15s ease-out",
                  }}
                  className="max-w-none absolute left-1/2 top-1/2"
                />

                {/* Circle Mask Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />
                  <div className="w-[220px] h-[220px] rounded-full border-2 border-white/80 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] absolute" />
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="w-full flex items-center gap-3 px-2">
                <Icon icon="solar:magnifer-zoom-out-linear" className="w-4.5 h-4.5 text-gray-400" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-forest"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                />
                <Icon icon="solar:magnifer-zoom-in-linear" className="w-4.5 h-4.5 text-gray-400" />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4.5 border-t border-gray-100 flex gap-3 bg-white">
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 py-2.5 bg-forest hover:bg-forest/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Icon icon="solar:crop-minimalistic-linear" className="w-4.5 h-4.5" />
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
