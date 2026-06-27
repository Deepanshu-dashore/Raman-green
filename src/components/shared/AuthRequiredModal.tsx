"use client";

import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hideAuthModal } from "@/store/authSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthRequiredModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.auth.showAuthModal);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    dispatch(hideAuthModal());
  };

  const handleLoginRedirect = () => {
    dispatch(hideAuthModal());
    const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?redirect=${redirectUrl}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-start p-6">
          {/* Subtle Backdrop overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#121c15]/20 backdrop-blur-xs cursor-pointer"
          />

          {/* Attractive Card Modal - Positioned Top Left */}
          <motion.div
            initial={{ opacity: 0, x: -50, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-forest/10 overflow-hidden flex flex-row h-[220px]"
          >
            {/* Left Side: Botanical themed image */}
            <div className="w-[40%] bg-cream relative overflow-hidden select-none border-r border-[#1b3022]/5">
              <img
                src="/botanical_crop_warm.png"
                alt="Botanical background"
                className="w-full h-full object-cover scale-105"
                onError={(e) => {
                  // Fallback to watercolor leaves if botanical crop not found
                  (e.target as HTMLImageElement).src = "/watercolor_leaves.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
            </div>

            {/* Right Side: Clean login content */}
            <div className="w-[60%] p-5 flex flex-col justify-between relative bg-[#fdfcf7]">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-1 rounded-full text-charcoal/40 hover:bg-forest/5 hover:text-forest transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <Icon icon="lucide:x" className="w-4.5 h-4.5" />
              </button>

              {/* Header & Copy */}
              <div className="pr-4 mt-2">
                <div className="flex items-center gap-1 mb-1">
                  <Icon icon="solar:leaf-bold" className="text-forest w-4 h-4" />
                  <span className="text-[10px] font-bold text-forest uppercase tracking-widest font-inter">
                    Raman Green
                  </span>
                </div>
                <h4 className="font-playfair text-base font-bold text-charcoal leading-tight mb-1.5">
                  Sign In Required
                </h4>
                <p className="text-[11px] font-inter text-charcoal/65 leading-relaxed font-semibold">
                  Log in to add pure, heritage organic products to your cart.
                </p>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex items-center gap-2 mt-4 select-none">
                <button
                  onClick={handleLoginRedirect}
                  className="flex-1 py-2 bg-forest hover:bg-forest/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                >
                  Log In
                </button>
                <button
                  onClick={handleClose}
                  className="px-3 py-2 border border-charcoal/10 hover:border-charcoal/30 hover:bg-charcoal/5 text-charcoal text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
