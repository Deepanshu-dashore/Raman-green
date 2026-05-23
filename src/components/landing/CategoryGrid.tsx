"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@iconify/react";

const categories = [
  {
    title: "Heritage Seeds",
    subtitle: "Nutrient-dense foundations for your daily rituals.",
    tag: "12 products",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
    href: "/shop?category=seeds",
    span: "large",
  },
  {
    title: "Artisanal Dry Foods",
    subtitle: "",
    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=800&q=80",
    href: "/shop?category=dry-foods",
    span: "small",
  },
  {
    title: "Sustainably Sourced Crops",
    subtitle: "",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
    href: "/shop?category=crops",
    span: "small",
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-charcoal tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm font-inter text-charcoal/60 mt-2 max-w-md leading-relaxed">
              Explore our meticulously sourced categories, each offering unparalleled purity and nutritional integrity.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-inter font-semibold text-charcoal/70 hover:text-forest transition-colors"
          >
            View All Categories
            <Icon icon="lucide:arrow-right" className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Large card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href={categories[0].href} className="group block relative h-[400px] md:h-[480px] rounded-lg overflow-hidden">
              <img
                src={categories[0].image}
                alt={categories[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                {categories[0].tag && (
                  <span className="inline-block px-3 py-1 mb-3 text-[10px] font-inter font-semibold uppercase tracking-wider bg-moss text-white rounded">
                    {categories[0].tag}
                  </span>
                )}
                <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-white">{categories[0].title}</h3>
                <p className="text-sm font-inter text-white/80 mt-1">{categories[0].subtitle}</p>
              </div>
            </Link>
          </motion.div>

          {/* Right column — 2 stacked */}
          <div className="flex flex-col gap-4">
            {categories.slice(1).map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 * (i + 1) }}
              >
                <Link href={cat.href} className="group block relative h-[230px] rounded-lg overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="font-playfair text-xl font-semibold text-white">{cat.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile link */}
        <div className="md:hidden mt-6 text-center">
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-inter font-semibold text-charcoal/70 hover:text-forest transition-colors">
            View All Categories
            <Icon icon="lucide:arrow-right" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
