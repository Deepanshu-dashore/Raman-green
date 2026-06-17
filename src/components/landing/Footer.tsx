"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const marqueeItems = [
  { word: "HERITAGE", icon: "solar:award-bold-duotone" },
  { word: "ORGANIC", icon: "solar:leaf-bold-duotone" },
  { word: "PRECISION", icon: "solar:target-bold-duotone" },
  { word: "PURITY", icon: "solar:water-drops-bold-duotone" },
  { word: "VITALITY", icon: "solar:heart-pulse-bold-duotone" },
  { word: "SUSTAINABLE", icon: "solar:earth-bold-duotone" },
  { word: "QUALITY", icon: "solar:verified-check-bold-duotone" },
  { word: "NATURAL", icon: "solar:tree-bold-duotone" },
  { word: "TRUSTED", icon: "solar:shield-check-bold-duotone" },
  { word: "EXCELLENCE", icon: "solar:star-bold-duotone" },
  { word: "WELLNESS", icon: "solar:meditation-round-bold-duotone" },
  { word: "FRESHNESS", icon: "solar:sun-bold-duotone" },
];

export default function Footer() {
  return (
    <footer className="bg-[#FAF9E6] border-t border-[#EAE9CE] font-inter relative overflow-hidden">
      {/* 1. Sprout-Green Infinite Scrolling Marquee */}
      <div className="w-full overflow-hidden bg-[#C9EC6F] py-5 flex items-center border-b border-[#EAE9CE] relative z-10">
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
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 pt-16 pb-36 md:pb-48 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-4 flex flex-col justify-start z-10">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="Raman Green"
                width={140}
                height={70}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
            <p className="text-[13px] text-charcoal/80 leading-relaxed font-semibold max-w-sm">
              Raman Green was founded to create an effective bridge between Indian marginal farmers and buyers across the world seeking high-quality organic produce.
            </p>
            
            {/* Social Icons (Vibrant colored circle design matching attached reference) */}
            <div className="flex items-center gap-3 mt-6">
              <a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook" 
                className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-90 hover:scale-110 transition-all cursor-pointer shadow-sm"
              >
                <Icon icon="ri:facebook-fill" className="w-4.5 h-4.5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram" 
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white hover:opacity-90 hover:scale-110 transition-all cursor-pointer shadow-sm"
              >
                <Icon icon="ri:instagram-line" className="w-4.5 h-4.5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X" 
                className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-white hover:opacity-90 hover:scale-110 transition-all cursor-pointer shadow-sm"
              >
                <Icon icon="ri:twitter-x-fill" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Help */}
          <div className="md:col-span-2 flex flex-col z-10">
            <h4 className="font-playfair text-base font-extrabold text-forest mb-4 tracking-tight">
              Help
            </h4>
            <ul className="space-y-2.5 font-semibold text-charcoal/85 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-forest transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-forest transition-colors">
                  Return & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-forest transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/media" className="hover:text-forest transition-colors">
                  Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="md:col-span-2 flex flex-col z-10">
            <h4 className="font-playfair text-base font-extrabold text-forest mb-4 tracking-tight">
              Quick Links
            </h4>
            <ul className="space-y-2.5 font-semibold text-charcoal/85 text-xs">
              <li>
                <Link href="/shop" className="hover:text-forest transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-forest transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/media" className="hover:text-forest transition-colors">
                  Media
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-forest transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="md:col-span-4 flex flex-col z-10 text-xs font-semibold text-charcoal/85">
            <h4 className="font-playfair text-base font-extrabold text-forest mb-4 tracking-tight">
              Contact Us
            </h4>
            
            <div className="space-y-4">
              <div>
                <p className="font-bold text-forest mb-1 text-[11px] uppercase tracking-wider">Corporate Office</p>
                <p className="leading-relaxed">
                  D 325-326, Agro Food Park, RIICO,<br />
                  Sri Ganganagar, Rajasthan, India, 335002
                </p>
              </div>

              <div>
                <p className="font-bold text-forest mb-1 text-[11px] uppercase tracking-wider">Phone</p>
                <div className="space-y-0.5">
                  <a href="tel:+919672520005" className="hover:text-forest block">+91 96725 20005</a>
                  <a href="tel:+919460430830" className="hover:text-forest block">+91 94604 30830</a>
                </div>
              </div>

              <div>
                <p className="font-bold text-forest mb-1 text-[11px] uppercase tracking-wider">Email</p>
                <a href="mailto:feedback@ramangreen.com" className="hover:text-forest">
                  feedback@ramangreen.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Illustration Background (footerBg.png) */}
      <div 
        className="absolute inset-x-0 bottom-0 h-40 md:h-full w-full pointer-events-none opacity-90 z-0"
        style={{
          backgroundImage: `url('/footerBg.png')`,
          backgroundPosition: 'bottom center',
          backgroundSize: '1440px auto',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* 4. Bottom Copyright Bar */}
      <div className="border-t border-[#EAE9CE] py-6 relative z-10 bg-[#FAF9E6]/60 backdrop-blur-xs">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-forest/60">
            © {new Date().getFullYear()} Raman Green. All rights reserved.
          </p>
          
          {/* Badge Outline Icons */}
          <div className="flex items-center gap-4 text-forest/40">
            <span title="Secure Payment">
              <Icon icon="lucide:credit-card" className="w-5 h-5 hover:text-forest/70 transition-colors" />
            </span>
            <span title="Certified Organic Quality">
              <Icon icon="lucide:shield-check" className="w-5 h-5 hover:text-forest/70 transition-colors" />
            </span>
            <span title="100% Eco Friendly">
              <Icon icon="lucide:leaf" className="w-5 h-5 hover:text-forest/70 transition-colors" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

