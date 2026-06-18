"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface AddedToCartToastProps {
  visible: boolean;
  id: string;
  productName: string;
  productImage: string;
  variantWeight: string;
  variantPrice: number;
  quantity: number;
  cartTotalItems: number;
  cartTotalPrice: number;
}

export default function AddedToCartToast({
  visible,
  id,
  productName,
  productImage,
  variantWeight,
  variantPrice,
  quantity,
  cartTotalItems,
  cartTotalPrice,
}: AddedToCartToastProps) {
  const router = useRouter();

  const handleClose = () => {
    toast.dismiss(id);
  };

  const handleViewCart = () => {
    toast.dismiss(id);
    router.push("/cart");
  };

  const handleCheckout = () => {
    toast.dismiss(id);
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Modal positioned top-right */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, x: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-[75px] md:top-[85px] right-2 md:right-4 w-full max-w-[380px] bg-white rounded-2xl border border-charcoal/5 shadow-[0_12px_36px_rgba(27,48,34,0.08)] p-4 font-inter text-charcoal pointer-events-auto z-50"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-charcoal/10">
              <div className="flex items-center gap-2.5">
                <div className="w-6.5 h-6.5 rounded-full bg-[#3e8e41] text-white flex items-center justify-center shrink-0">
                  <Icon icon="solar:check-read-linear" className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 leading-tight">Added to Cart!</h3>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-6 h-6 rounded-full bg-charcoal/5 hover:bg-charcoal/10 flex items-center justify-center text-charcoal/60 transition-colors shrink-0 cursor-pointer"
              >
                <Icon icon="bitcoin-icons:cross-filled" className="w-4 h-4" />
              </button>
            </div>

            {/* Product details */}
            <div className="flex gap-4 py-4 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-dark/20 border border-charcoal/5 shrink-0 select-none">
                <img
                  src={productImage || "/placeholder.png"}
                  alt={productName}
                  className="w-full h-full object-cover"
                  draggable="false"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <h4 className="font-playfair text-base font-bold text-gray-900 mb-0.5 leading-snug line-clamp-1">
                  {productName}
                </h4>
                <p className="text-[11px] text-gray-500 font-semibold mb-1">
                  Weight: <span className="text-gray-900 font-bold">{variantWeight}</span>{" "}
                  <span className="mx-1.5 text-forest leading-none">&bull;</span> Qty:{" "}
                  <span className="text-gray-900 font-bold">{quantity}</span>
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-gray-950">
                    ₹{variantPrice.toLocaleString("en-IN")}
                  </span>
                  {quantity > 1 && (
                    <span className="text-[10px] text-charcoal/50 font-semibold">
                      (Subtotal: ₹{(variantPrice * quantity).toLocaleString("en-IN")})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cart summary */}
            <div className="bg-[#f6f9f6] rounded-xl p-3 mb-4 border border-charcoal/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                <Icon icon="solar:bag-3-linear" className="w-4.5 h-4.5 text-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">
                  Cart Subtotal ({cartTotalItems}{" "}
                  {cartTotalItems === 1 ? "item" : "items"})
                </div>
                <div className="text-[10px] text-gray-400 font-medium">Free shipping eligible</div>
              </div>
              <div className="text-base font-bold text-[#2e4c3a] shrink-0">
                ₹{cartTotalPrice.toLocaleString("en-IN")}
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleViewCart}
                className="h-9 rounded-lg border border-[#2e4c3a] text-[#2e4c3a] hover:bg-[#fbf9f6] flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all duration-200 cursor-pointer"
              >
                <Icon icon="solar:bag-linear" className="w-4 h-4" />
                View Cart
              </button>
              <button
                onClick={handleCheckout}
                className="h-9 rounded-lg bg-[#2e4c3a] hover:bg-[#233a2c] text-white flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all duration-200 shadow-xs cursor-pointer"
              >
                Checkout
                <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
