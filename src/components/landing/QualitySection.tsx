"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function QualitySection() {
  return (
    <section id="quality" className="py-20 md:py-28 bg-white">
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
              Our commitment to purity and safety goes beyond traditional farming. Inside our Good Manufacturing Practices (GMP) compliant facilities, we utilize advanced cold-processing methodologies to clean, dry, and mill our organic harvests. By keeping temperatures strictly controlled, we preserve the vital dietary fibers and micronutrients.
            </p>
            <p className="text-sm font-inter text-charcoal/65 mt-4 leading-relaxed">
              In close collaboration with research laboratories at Dr. C.V. Raman University (CVRU) in Khandwa, we verify that every batch is 100% glyphosate-free, with zero chemical residues or artificial preservatives, bringing pure, certified wellness straight to your home.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 mt-8 text-sm font-inter font-semibold text-forest hover:text-moss transition-colors"
            >
              Explore Our Products
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
                src="/quality_processing.png"
                alt="Modern food cold-processing facility"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-lg overflow-hidden h-[220px] mt-8">
              <img
                src="/quality_lab.png"
                alt="Quality control testing lab at CVRU"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
