"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1920&q=80",
    alt: "Organic seeds and grains",
  },
  {
    image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=1920&q=80",
    alt: "Organic farming",
  },
  {
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&q=80",
    alt: "Natural ingredients",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[520px] md:h-[620px] overflow-hidden">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].alt}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest/70 via-forest/50 to-forest/80" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="inline-block px-4 py-1.5 rounded text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-forest bg-sage mb-6">
            Premium Organic Foods
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-playfair text-4xl md:text-6xl font-bold text-white leading-tight md:leading-[1.15] tracking-[-0.02em] max-w-2xl"
        >
          Cultivating Heritage,
          <br />
          Defining Wellness
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-forest text-white text-sm font-inter font-semibold tracking-[0.05em] rounded hover:bg-forest/90 transition-all border border-white/20"
          >
            Shop Collections
            <Icon icon="lucide:arrow-right" className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-white w-6" : "bg-white/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
