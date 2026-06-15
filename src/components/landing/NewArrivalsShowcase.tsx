"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";
export default function NewArrivalsShowcase() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const res = await fetch("/api/products/minimal?newest=true&limit=4");
        if (res.ok) {
          const json = await res.json();
          const productsArray = Array.isArray(json.data) ? json.data : json.data?.products;
          if (json.success && Array.isArray(productsArray) && productsArray.length > 0) {
            setProducts(productsArray);
          }
        }
      } catch (err) {
        console.error("Failed to fetch new arrivals from API:", err);
      }
    }
    fetchNewArrivals();
  }, []);

  return (
    <section className="py-20 md:py-28 bg-[#faf8f4] border-t border-charcoal/5">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[11px] font-inter font-semibold uppercase tracking-wider text-moss bg-sage/30 px-3 py-1 rounded-full">
            FRESHLY CULTIVATED
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mt-3">
            New Season Arrivals
          </h2>
          <p className="text-sm font-inter text-charcoal/60 mt-3 max-w-lg mx-auto leading-relaxed">
            Experience our newly harvested botanicals and organic seeds, brought directly from heritage farms to elevate your ritual.
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product.id || idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="h-full"
            >
              <ProductCard
                product={{
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.image,
                  hoverImage: product.hoverImage,
                  tags: product.tags,
                }}
                index={idx}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
