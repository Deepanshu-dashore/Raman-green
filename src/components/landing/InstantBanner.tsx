"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function InstantBanner() {
  return (
    <section className="bg-forest">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-[1280px] mx-auto px-5 md:px-16 py-14 md:py-20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-white">
              Instant Nutrition
            </h2>
            <p className="text-sm font-inter text-white/70 mt-2 max-w-md leading-relaxed">
              Wholesome, organic meals ready in minutes for the fast-paced modern life.
            </p>
          </div>
          <Link
            href="/shop?category=instant"
            className="inline-flex items-center gap-2 text-sm font-inter font-semibold text-sage hover:text-white transition-colors"
          >
            Explore Range
            <Icon icon="lucide:arrow-right" className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
