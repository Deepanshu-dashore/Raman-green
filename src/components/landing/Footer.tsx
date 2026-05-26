"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const exploreLinks = [
  { label: "Provenance", href: "/about" },
  { label: "Sustainability", href: "/about" },
  { label: "Lab Reports", href: "/about" },
  { label: "Wholesale", href: "/about" },
];

const supportLinks = [
  { label: "Shipping", href: "/contact" },
  { label: "Contact Us", href: "/contact" },
  { label: "Returns Policy", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
];

const marqueeItems = [
  { word: "HERITAGE", icon: "solar:award-bold-duotone" },
  { word: "ORGANIC", icon: "solar:leaf-bold-duotone" },
  { word: "PRECISION", icon: "solar:target-bold-duotone" },
  { word: "PURITY", icon: "solar:water-drops-bold-duotone" },
  { word: "VITALITY", icon: "solar:heart-pulse-bold-duotone" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 font-inter relative">
      {/* 0. Brand Wave/Forest SVG Overlap Transition */}
      <div className="w-full relative z-20 -mt-20 md:-mt-28 -mb-px overflow-hidden select-none pointer-events-none">
        <img 
          src="/footer-overlap.svg" 
          alt="" 
          className="w-full h-auto object-cover"
          onError={(e) => {
            // Gracefully hide the overlay container if the asset has not been uploaded yet
            const target = e.target as HTMLElement;
            if (target && target.parentElement) {
              target.parentElement.style.display = 'none';
            }
          }}
        />
      </div>

      {/* 1. Sprout-Green Infinite Scrolling Marquee / Scrollable Line */}
      <div className="w-full overflow-hidden bg-[#C9EC6F] py-5 flex items-center border-b border-gray-100 relative z-10">
        <div className="relative w-full flex overflow-x-hidden">
          <motion.div
            className="flex whitespace-nowrap text-[11px] md:text-xs font-bold tracking-[0.25em] text-forest/70 uppercase"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 20,
              repeat: Infinity,
            }}
          >
            {/* Duplicated blocks for perfect seamless scroll */}
            <div className="flex shrink-0 items-center gap-12 pr-12">
              {marqueeItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-12">
                  <span className="flex items-center gap-2.5">
                    <Icon icon={item.icon} className="w-4.5 h-4.5 text-forest/80 shrink-0" />
                    <span>{item.word}</span>
                  </span>
                  <span className="opacity-30 font-light text-xs">•</span>
                </span>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-12 pr-12">
              {marqueeItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-12">
                  <span className="flex items-center gap-2.5">
                    <Icon icon={item.icon} className="w-4.5 h-4.5 text-forest/80 shrink-0" />
                    <span>{item.word}</span>
                  </span>
                  <span className="opacity-30 font-light text-xs">•</span>
                </span>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-12 pr-12">
              {marqueeItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-12">
                  <span className="flex items-center gap-2.5">
                    <Icon icon={item.icon} className="w-4.5 h-4.5 text-forest/80 shrink-0" />
                    <span>{item.word}</span>
                  </span>
                  <span className="opacity-30 font-light text-xs">•</span>
                </span>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-12 pr-12">
              {marqueeItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-12">
                  <span className="flex items-center gap-2.5">
                    <Icon icon={item.icon} className="w-4.5 h-4.5 text-forest/80 shrink-0" />
                    <span>{item.word}</span>
                  </span>
                  <span className="opacity-30 font-light text-xs">•</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. Main Footer Columns */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand section (col-span-4) */}
          <div className="md:col-span-4 flex flex-col justify-start">
            <h3 className="font-inter text-2xl font-extrabold text-forest tracking-tight">
              Raman Green
            </h3>
            <p className="text-sm text-charcoal/70 leading-relaxed max-w-xs mt-3 font-medium">
              Cultivating vitality through premium organic excellence. Rooted in heritage, powered by nature.
            </p>
            
            {/* Minimal Circular Social Buttons */}
            <div className="flex items-center gap-2.5 mt-6">
              <a 
                href="#" 
                aria-label="Instagram" 
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-charcoal/50 hover:text-forest hover:border-forest hover:bg-gray-50 transition-all cursor-pointer"
              >
                <Icon icon="lucide:instagram" className="w-4.5 h-4.5" />
              </a>
              <a 
                href="#" 
                aria-label="Contact / Email" 
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-charcoal/50 hover:text-forest hover:border-forest hover:bg-gray-50 transition-all cursor-pointer"
              >
                <Icon icon="lucide:mail" className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Explore section (col-span-2) */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="font-inter text-[11px] font-extrabold uppercase tracking-[0.15em] text-charcoal mb-4">
              Explore
            </h4>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-inter font-semibold text-charcoal/65 hover:text-forest transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support section (col-span-2) */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="font-inter text-[11px] font-extrabold uppercase tracking-[0.15em] text-charcoal mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-inter font-semibold text-charcoal/65 hover:text-forest transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter section (col-span-4) */}
          <div className="md:col-span-4 flex flex-col">
            <h4 className="font-inter text-[11px] font-extrabold uppercase tracking-[0.15em] text-charcoal mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-charcoal/70 leading-relaxed font-medium mb-4 max-w-xs">
              Join our circle for seasonal harvests and heritage stories.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2.5 max-w-xs">
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none text-charcoal font-medium placeholder-gray-400 focus:border-forest/20 transition-colors"
                required
              />
              <button 
                type="submit"
                className="w-full bg-forest text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl hover:bg-forest/90 transition-colors duration-300 text-center block cursor-pointer shadow-sm"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* 3. Bottom Copyright Bar with Clean Badges */}
      <div className="border-t border-gray-100 py-6">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-inter font-medium text-charcoal/40">
            © {new Date().getFullYear()} Raman Green. Cultivating vitality through premium organic excellence.
          </p>
          
          {/* Badge Outline Icons */}
          <div className="flex items-center gap-4 text-charcoal/30">
            <span title="Secure Payment">
              <Icon icon="lucide:credit-card" className="w-5 h-5 hover:text-forest/50 transition-colors" />
            </span>
            <span title="Certified Organic Quality">
              <Icon icon="lucide:shield-check" className="w-5 h-5 hover:text-forest/50 transition-colors" />
            </span>
            <span title="100% Eco Friendly">
              <Icon icon="lucide:leaf" className="w-5 h-5 hover:text-forest/50 transition-colors" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
