"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export default function InstantBanner() {
  const stats = [
    {
      value: "92%",
      label: "Positive feedback",
      icon: "solar:chat-square-like-linear",
    },
    {
      value: "18K+",
      label: "Customers loved",
      icon: "solar:heart-linear",
    },
    {
      value: "18K+",
      label: "Followers",
      icon: "solar:user-rounded-linear",
    },
    {
      value: "180+",
      label: "retail stores",
      icon: "solar:shop-linear",
    },
  ];

  const benefits = [
    {
      label: "100% Organic",
      sub: "Pure Botanical",
      icon: "solar:leaf-linear",
    },
    {
      label: "3-Min Prep",
      sub: "Quick Routine",
      icon: "lucide:timer",
    },
    {
      label: "Farm-to-Bowl",
      sub: "Direct Sourced",
      icon: "lucide:sprout",
    },
    {
      label: "Nutrient Locked",
      sub: "Vitality Retained",
      icon: "solar:shield-check-linear",
    },
  ];

  // Wind sway animation for corners
  const swayLeft: any = {
    animate: {
      rotate: [12, 17, 8, 12],
      x: [0, 3, -2, 0],
      y: [0, 2, -1, 0],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const swayRight: any = {
    animate: {
      rotate: [-45, -40, -48, -45],
      x: [0, -3, 2, 0],
      y: [0, -2, 1, 0],
      transition: {
        duration: 11,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const swayTopRight: any = {
    animate: {
      rotate: [90, 95, 85, 90],
      x: [0, -2, 3, 0],
      y: [0, 3, -1, 0],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const swayBottomRight: any = {
    animate: {
      rotate: [-90, -85, -95, -90],
      x: [0, 2, -2, 0],
      y: [0, -3, 2, 0],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Custom float animation helper for small individual floating leaves
  const floatAnim = (duration: number, delay: number, startRotate: number): any => ({
    animate: {
      y: [0, -8, 8, 0],
      x: [0, 6, -6, 0],
      rotate: [startRotate, startRotate + 10, startRotate - 10, startRotate],
      transition: {
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  });

  return (
    <section className="bg-cream py-10 md:py-14 text-charcoal overflow-hidden border-b border-[#1b1c1a]/5 select-none">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16">
        
        {/* Main Banner Container with Generated Landscape Background */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[32px] border border-charcoal/5 shadow-[0_12px_40px_rgba(27,48,34,0.02)] overflow-hidden min-h-[200px]"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(250, 249, 246, 0.85), rgba(250, 249, 246, 0.93)), url('/banner_artwork_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Ambient organic circular lines */}
          <div className="absolute top-0 right-1/4 w-48 h-48 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-forest">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          {/* ================= FLOATING & SWAYING LEAVES ================= */}
          
          {/* Top Left Leaf Branch */}
          <motion.div 
            variants={swayLeft} 
            animate="animate" 
            className="absolute -top-12 -left-12 w-40 h-40 pointer-events-none mix-blend-multiply opacity-85 z-10"
          >
            <img src="/watercolor_leaves.png" className="w-full h-full object-contain" alt="" />
          </motion.div>

          {/* Bottom Left Leaf Branch */}
          <motion.div 
            variants={swayRight} 
            animate="animate" 
            className="absolute -bottom-10 -left-10 w-32 h-32 pointer-events-none mix-blend-multiply opacity-85 z-10"
          >
            <img src="/watercolor_leaves.png" className="w-full h-full object-contain" style={{ transform: "scaleX(-1)" }} alt="" />
          </motion.div>

          {/* Top Right Leaf Branch */}
          <motion.div 
            variants={swayTopRight} 
            animate="animate" 
            className="absolute -top-12 -right-12 w-40 h-40 pointer-events-none mix-blend-multiply opacity-85 z-10"
          >
            <img src="/watercolor_leaves.png" className="w-full h-full object-contain" alt="" />
          </motion.div>

          {/* Bottom Right Leaf Branch */}
          <motion.div 
            variants={swayBottomRight} 
            animate="animate" 
            className="absolute -bottom-10 -right-10 w-32 h-32 pointer-events-none mix-blend-multiply opacity-80 z-10"
          >
            <img src="/watercolor_leaves.png" className="w-full h-full object-contain" alt="" />
          </motion.div>

          {/* Floating Leaf 1 (Green Leaf cropped from left half of single_leaf_art.png) */}
          <motion.div
            variants={floatAnim(14, 0, 15)}
            animate="animate"
            className="absolute top-[20%] left-[22%] w-10 h-10 pointer-events-none mix-blend-multiply opacity-65 z-10 overflow-hidden hidden sm:block"
          >
            <div className="relative w-full h-full">
              <img src="/single_leaf_art.png" className="absolute left-0 top-0 w-[200%] h-full object-contain" alt="" />
            </div>
          </motion.div>

          {/* Floating Leaf 2 (Orange Leaf cropped from right half of single_leaf_art.png) */}
          <motion.div
            variants={floatAnim(16, 2.5, -45)}
            animate="animate"
            className="absolute bottom-[22%] left-[45%] w-10 h-10 pointer-events-none mix-blend-multiply opacity-70 z-10 overflow-hidden hidden md:block"
          >
            <div className="relative w-full h-full">
              <img src="/single_leaf_art.png" className="absolute right-0 top-0 w-[200%] h-full object-contain" alt="" />
            </div>
          </motion.div>

          {/* Floating Leaf 3 (Green Leaf cropped from left half of single_leaf_art.png, rotated/scaled) */}
          <motion.div
            variants={floatAnim(15, 1.2, 75)}
            animate="animate"
            className="absolute top-[32%] right-[24%] w-11 h-11 pointer-events-none mix-blend-multiply opacity-65 z-10 overflow-hidden hidden sm:block"
          >
            <div className="relative w-full h-full">
              <img src="/single_leaf_art.png" className="absolute left-0 top-0 w-[200%] h-full object-contain" alt="" />
            </div>
          </motion.div>

          {/* ================= STATS DISPLAY CONTENT ================= */}
          <div className="relative z-10 flex flex-col md:flex-row items-stretch justify-between w-full py-12 md:py-16 px-6 md:px-12 gap-y-10 md:gap-y-0">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="flex-1 flex flex-col items-center text-center relative px-2"
              >
                {/* Thin-bordered Forest Green Circular Icon Wrapper */}
                <div className="w-14 h-14 rounded-full border border-forest/35 flex items-center justify-center text-forest mb-4.5 bg-white/45 backdrop-blur-xs shadow-[0_4px_12px_rgba(27,48,34,0.03)] hover:scale-105 hover:border-forest/60 transition-all duration-300">
                  <Icon icon={stat.icon} className="w-6.5 h-6.5" />
                </div>
                
                {/* Bold Stat Value */}
                <span className="text-3xl md:text-3.5xl lg:text-4.5xl font-inter font-extrabold text-forest tracking-tight leading-none">
                  {stat.value}
                </span>
                
                {/* Descriptive Stat Label */}
                <span className="text-[11.5px] md:text-[12px] font-inter font-medium text-charcoal/80 mt-2.5 max-w-[140px] leading-relaxed">
                  {stat.label}
                </span>

                {/* Vertical Divider Line for Desktop */}
                {idx < stats.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-14 bg-forest/10" />
                )}
              </motion.div>
            ))}
          </div>

        </motion.div>

        {/* ================= BENEFITS STRIP UNDER THE CARD ================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 md:mt-10 flex flex-wrap justify-center md:justify-between items-center gap-y-6 px-6 py-6 bg-white/50 backdrop-blur-xs rounded-[20px] border border-charcoal/5 shadow-[0_8px_30px_rgba(27,48,34,0.01)]"
        >
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3.5 px-4 md:px-2">
              <div className="w-9 h-9 rounded-full bg-sage/20 text-forest flex items-center justify-center shadow-xs">
                <Icon icon={benefit.icon} className="w-5.5 h-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] md:text-[12px] font-inter font-extrabold text-forest uppercase tracking-widest leading-none">
                  {benefit.label}
                </span>
                <span className="text-[9px] md:text-[10px] font-inter font-semibold text-charcoal/40 mt-1.5 uppercase tracking-wider">
                  {benefit.sub}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
