"use client";

import React, { useState, useEffect } from "react";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    // Sync wishlist from localStorage if any, otherwise it defaults to empty
    try {
      const stored = localStorage.getItem("rg-wishlist");
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <LandingLayout>
      <div className="storefront bg-cream text-charcoal min-h-screen py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16">
          <div className="max-w-xl mb-12">
            <h1 className="text-4xl md:text-5.5xl font-playfair font-extrabold tracking-tight text-forest mb-4">
              My Wishlist
            </h1>
            <p className="text-sm md:text-base text-charcoal/70 leading-relaxed font-medium">
              Save your favorite heritage seeds, organic crops, and premium mixes for later.
            </p>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((item, idx) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between h-full">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-4">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-lg text-forest mb-1">{item.name}</h3>
                    <p className="text-sm text-charcoal/80 font-bold mb-4">₹{item.price}</p>
                    <div className="flex gap-2">
                      <Link
                        href={`/shop/${item.id}`}
                        className="flex-1 bg-forest text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-forest/90 transition-colors text-center"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center max-w-md mx-auto flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-forest mb-4 border border-forest/10">
                <Icon icon="solar:heart-linear" className="w-7 h-7" />
              </div>
              <h3 className="font-playfair text-xl font-bold text-forest mb-2">Your Wishlist is Empty</h3>
              <p className="text-xs text-charcoal/50 leading-relaxed font-semibold max-w-xs mb-6">
                Explore our premium organic collections and tap the heart icon to save products here.
              </p>
              <Link
                href="/shop"
                className="bg-forest text-white text-xs font-bold uppercase tracking-wider py-3.5 px-8 rounded-xl hover:bg-forest/90 transition-colors shadow-sm cursor-pointer"
              >
                Browse Collections
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </LandingLayout>
  );
}
