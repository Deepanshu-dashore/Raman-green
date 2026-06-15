"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";

const slides = [
  {
    video: "/home/hero-Video/intro1.mp4",
    tag: "Premium Organic Seeds",
    title: "Cultivating Heritage, Defining Wellness",
    desc: "Sustainably harvested organic seeds, pumpkin seeds, flax, and chia seeds packed with raw omega-3 nutrients."
  },
  {
    video: "/home/hero-Video/intor2.mp4",
    tag: "Pure Instant Mixes",
    title: "Wholesome Nourishment in an Instant",
    desc: "Nutrient-rich, preservative-free instant millet mixes and organic breakfast blends crafted for modern health."
  },
  {
    video: "/home/hero-Video/intro4.mp4",
    tag: "Organic Herbal Powders",
    title: "Pure Wellness, Stone-Ground to Perfection",
    desc: "100% natural, glyphosate-free Moringa, Ashwagandha, and botanical powders rich in living nutrients."
  },
  {
    video: "/home/hero-Video/intro5.mp4",
    tag: "Indian Culinary Flavours",
    title: "Authentic Indian Sambhar Masala",
    desc: "Experience heritage Indian tastes crafted with freshly stone-ground whole chillies, coriander seeds, and cumin seeds."
  },
];

export default function HeroIntro() {
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  // Play active video and pause others
  useEffect(() => {
    slides.forEach((_, idx) => {
      const video = videoRefs.current[idx];
      if (video) {
        if (idx === current) {
          video.currentTime = 0;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.log("Autoplay prevented or video play error: ", err);
            });
          }
        } else {
          video.pause();
        }
      }
    });
  }, [current]);


  return (
    <section className="relative w-full h-[520px] md:h-[85dvh] overflow-hidden bg-black group">
      {/* Background videos */}
      <div className="absolute inset-0">
        {slides.map((slide, idx) => (
          <video
            key={idx}
            ref={(el) => {
              videoRefs.current[idx] = el;
            }}
            src={slide.video}
            muted
            playsInline
            preload="auto"
            onEnded={() => {
              if (idx === current) {
                handleNext();
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}
      </div>

      {/* Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-20" />

      {/* Dynamic Slide Content */}
      <div className="relative z-30 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === current ? "bg-sage w-7 shadow-sm" : "bg-white/40 hover:bg-white/60 w-2"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
