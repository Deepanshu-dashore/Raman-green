"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function StoreSection() {
  return (
    <section className="pt-24 md:pt-36 pb-28 md:pb-36">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-lg overflow-hidden h-[350px] md:h-[420px]"
          >
            <img
              src="/home/centerImg.png"
              alt="Raman Green Khandwa campus and farm"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-charcoal tracking-tight leading-tight">
              A Physical Extension of Our Philosophy
            </h2>
            <p className="text-sm font-inter text-charcoal/65 mt-5 leading-relaxed">
              Step into the world of Raman Green, a sustainable FMCG and agricultural initiative founded by the AISECT Group and Dr. C.V. Raman University (CVRU) in Khandwa, Madhya Pradesh. We merge scientific research with traditional, grassroots farming to process and deliver the highest quality of chemical-free, nutrient-dense millets.
            </p>
            <p className="text-sm font-inter text-charcoal/65 mt-4 leading-relaxed">
              By working hand-in-hand with tribal communities in the region, we ensure our ancient grains like Kodo and Kutki millets are cultivated responsibly. We preserve soil biology and empower farmers, bringing pure wellness directly to your home.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 mt-8 text-sm font-inter font-semibold text-forest hover:text-moss transition-colors"
            >
              Explore Our Flagship Store
              <Icon icon="lucide:arrow-right" className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
