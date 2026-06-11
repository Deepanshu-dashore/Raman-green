"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";

const slides = [
  {
    image: "/home/organic_seeds_hero.png",
    tag: "Premium Organic Seeds",
    title: "Cultivating Heritage, Defining Wellness",
    desc: "Sustainably harvested organic seeds, pumpkin seeds, flax, and chia seeds packed with raw omega-3 nutrients."
  },
  {
    image: "/home/instant_mix_hero.png",
    tag: "Pure Instant Mixes",
    title: "Wholesome Nourishment in an Instant",
    desc: "Nutrient-rich, preservative-free instant millet mixes and organic breakfast blends crafted for modern health."
  },
  {
    image: "/home/herbs_powder_hero.png",
    tag: "Organic Herbal Powders",
    title: "Pure Wellness, Stone-Ground to Perfection",
    desc: "100% natural, glyphosate-free Moringa, Ashwagandha, and botanical powders rich in living nutrients."
  },

  {
    image: "/home/sambhar_masala_hero.png",
    tag: "Indian Culinary Flavours",
    title: "Authentic Indian Sambhar Masala",
    desc: "Experience heritage Indian tastes crafted with freshly stone-ground whole chillies, coriander seeds, and cumin seeds."
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  // Rotate slides automatically with timer reset on slide changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full h-[520px] md:h-[620px] overflow-hidden group">
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
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

      {/* Next/Prev Navigation Arrows - Hidden by default, visible on hover */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 cursor-pointer shadow-xl"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 cursor-pointer shadow-xl"
      >
        <Icon icon="solar:alt-arrow-right-linear" className="w-6 h-6" />
      </button>

      {/* Dynamic Slide Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Tag */}
            <span className="inline-block px-4 py-1.5 rounded text-[10px] font-inter font-bold uppercase tracking-[0.18em] text-forest bg-sage mb-6 shadow-sm">
              {slides[current].tag}
            </span>

            {/* Heading */}
            <h1 className="font-playfair text-4xl md:text-6xl font-bold text-white leading-[1.15] md:leading-[1.12] tracking-[-0.02em] max-w-3xl mb-4">
              {slides[current].title}
            </h1>

            {/* Description */}
            <p className="font-inter text-sm md:text-base text-cream/80 max-w-xl leading-relaxed mb-8">
              {slides[current].desc}
            </p>

            {/* CTA Button */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest text-white text-xs font-inter font-bold uppercase tracking-[0.08em] rounded-lg hover:bg-forest/90 transition-all border border-white/15 shadow-lg group/btn"
            >
              Shop Collections
              <Icon
                icon="solar:arrow-right-linear"
                className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-300 text-sage"
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Pagination Indicators (Dots) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === current ? "bg-sage w-7 shadow-sm" : "bg-white/40 hover:bg-white/60 w-2"
                }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
