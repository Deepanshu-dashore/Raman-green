"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function QualitySection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-charcoal tracking-tight leading-tight">
              Precision Meets Purity
            </h2>
            <p className="text-sm font-inter text-charcoal/65 mt-5 leading-relaxed">
              Our commitment to quality extends far beyond the fields.
              Inside our state-of-the-art facilities, we utilize low-impact
              machinery to process our organic harvest.
            </p>
            <p className="text-sm font-inter text-charcoal/65 mt-4 leading-relaxed">
              By maintaining strict temperature controls and utilizing modern,
              clean-room technology, we ensure that every seed, crop, and blend
              retains its maximum nutritional integrity before it reaches your table.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 mt-8 text-sm font-inter font-semibold text-forest hover:text-moss transition-colors"
            >
              Learn About Our Standards
              <Icon icon="lucide:arrow-right" className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="rounded-lg overflow-hidden h-[220px]">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80"
                alt="Modern food processing facility"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-lg overflow-hidden h-[220px] mt-8">
              <img
                src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600&q=80"
                alt="Quality control lab"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
