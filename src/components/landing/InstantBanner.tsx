"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function InstantBanner() {
  const benefits = [
    { label: "100% Organic", icon: "lucide:leaf" },
    { label: "3-Min Prep", icon: "lucide:timer" },
    { label: "Farm-to-Bowl", icon: "lucide:sprout" },
    { label: "Nutrient Locked", icon: "lucide:sparkles" }
  ];

  return (
    <section className="bg-cream py-6 md:py-8 text-charcoal overflow-hidden border-b border-[#1b1c1a]/5">
      <div className="max-w-[1280px] mx-auto">

        {/* Main Banner Container - Gradient Deep Forest Pill Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-gradient-to-r from-[#061907] via-forest to-[#020c02] rounded-xl py-4 md:py-5 px-6 md:px-10 flex flex-col lg:flex-row items-center justify-between gap-6 border border-white/[0.04] shadow-lg overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(204,240,120,0.06),transparent_50%)] pointer-events-none" />

          {/* Left Block: Heading & Tag */}
          <div className="flex flex-col items-center lg:items-start gap-1.5 text-center lg:text-left z-10 shrink-0">
            <span className="bg-[#ccf078]/10 text-[#ccf078] px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#ccf078]/10">
              INSTANT NUTRITION
            </span>
            <p className="text-white/50 text-[10px] font-medium tracking-wide font-inter max-w-xs">
              Wholesome, organic meals ready in 3 minutes for modern life.
            </p>
          </div>

          {/* Middle Block: Card-style benefits strip */}
          <div className="flex flex-row items-stretch justify-center gap-3 md:gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 z-10">
            {benefits.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-xl px-4 py-3 transition-all duration-300 cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ccf078]/20 to-[#4d6700]/20 group-hover:from-[#ccf078]/40 group-hover:to-[#4d6700]/30 flex items-center justify-center transition-all duration-300">
                  <Icon icon={item.icon} className="w-4 h-4 text-[#ccf078] shrink-0" />
                </div>
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white/70 group-hover:text-[#ccf078] text-center transition-colors duration-300 font-inter">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Right Block: Button over decorative corner circle */}
          <div className="shrink-0 z-10 relative flex items-center justify-center">
            {/* Decorative accent circle - clipped at corner */}
            <div className="absolute -right-10 w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#ccf078]/10 border border-[#ccf078]/10 pointer-events-none" />
            <Link
              href="/shop?category=instant"
              className="relative bg-[#ccf078] hover:bg-white text-forest text-[10px] font-black uppercase tracking-wider py-2.5 px-6 rounded-full transition-all duration-300 shadow-[0_4px_12px_rgba(204,240,120,0.15)] inline-flex items-center gap-1.5 cursor-pointer hover:scale-102 hover:shadow-[0_4px_15px_rgba(255,255,255,0.2)] active:scale-98"
            >
              <span>Explore Range</span>
              <Icon icon="lucide:arrow-right" className="w-3 h-3 shrink-0" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
