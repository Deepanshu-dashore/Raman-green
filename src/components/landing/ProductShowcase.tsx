"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const products = [
  {
    name: "Premium Organic Chia",
    description: "Rich in Omega-3 fatty acids and antioxidants. Perfect for morning bowls and smoothies.",
    price: "₹85.00",
    image: "https://images.unsplash.com/photo-1614961233913-a5113e3d74f2?w=600&q=80",
    tags: ["High Fiber", "Vegan"],
  },
  {
    name: "Sun-Dried Heirloom Figs",
    description: "Naturally sweet, un-sulfured figs packed with essential minerals and energy.",
    price: "₹14.00",
    image: "https://images.unsplash.com/photo-1601379327928-bedfaf9da2d0?w=600&q=80",
    tags: ["No Added Sugar", "Iron Rich"],
  },
  {
    name: "Morning Ritual Oat Bowl",
    description: "A balanced blend of golden flax oats, nuts, seeds, and superfoods ready in 3 minutes.",
    price: "₹22.00",
    image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&q=80",
    tags: ["Gluten Free", "Quick Prep"],
  },
];

export default function ProductShowcase() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-charcoal tracking-tight">
            Curated for Your Ritual
          </h2>
          <p className="text-sm font-inter text-charcoal/60 mt-3 max-w-lg mx-auto leading-relaxed">
            Discover our best-selling botanical blends and heritage seeds, perfectly portioned to
            elevate your daily wellness routine.
          </p>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group"
            >
              {/* Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-cream-dark/30 mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <h3 className="font-playfair text-lg font-semibold text-charcoal">{product.name}</h3>
              <p className="text-xs font-inter text-charcoal/55 mt-1 leading-relaxed line-clamp-2">
                {product.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 text-[10px] font-inter font-medium uppercase tracking-wider text-moss bg-sage/30 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price & CTA */}
              <div className="flex items-center justify-between mt-4">
                <span className="font-inter text-base font-bold text-charcoal">{product.price}</span>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white text-xs font-inter font-semibold tracking-wider rounded hover:bg-forest/90 transition-colors">
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
