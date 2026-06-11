"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export function TrustStrip() {
  const items = [
    { label: "LEED Certified Facilities", icon: "lucide:building-2" },
    { label: "Made in India", icon: "lucide:map-pin" },
    { label: "Eco-Friendly", icon: "lucide:leaf" },
    { label: "Ethical Practices", icon: "lucide:heart" },
    { label: "100% Plant-Based", icon: "lucide:sprout" },
    { label: "Non-GMO & USDA-NOP", icon: "lucide:shield-check" }
  ];

  return (
    <div className="w-full bg-cream py-6 md:py-8 overflow-hidden select-none border-b border-[#1b1c1a]/5">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16">
        {/* Rounded Warm Beige Banner Pill Container */}
        <div className="bg-[#f2eae1] rounded-[24px] md:rounded-full py-5 px-6 md:px-10 flex flex-wrap justify-center items-center gap-x-10 gap-y-4 shadow-sm border border-[#1b1c1a]/5">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2.5 hover:scale-102 transition-transform duration-300"
            >
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-forest/10 shadow-xs text-forest">
                <Icon icon={item.icon} className="w-4 h-4" />
              </div>
              <span className="text-[10px] md:text-[11px] font-inter font-extrabold text-[#061907]/80 uppercase tracking-widest">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CertificationsSection() {
  const certs = [
    {
      title: "Glyphosate Residue Free",
      desc: "Independently tested and certified to be completely free from glyphosate, a harmful weedicide linked to serious health risks and banned in 20+ countries.",
      // High-Fidelity Circular Glyphosate Seal SVG
      svg: (
        <svg width="110" height="110" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto transform hover:rotate-6 transition-transform duration-500">
          <circle cx="60" cy="60" r="54" stroke="#4d6700" strokeWidth="2.5" strokeDasharray="3 3"/>
          <circle cx="60" cy="60" r="49" fill="#eaf3dc" stroke="#4d6700" strokeWidth="1.5"/>
          <circle cx="60" cy="60" r="42" stroke="#4d6700" strokeWidth="1" strokeDasharray="2 2"/>
          {/* Crossed Spoon & Fork Icon */}
          <path d="M52 50 C52 43, 56 41, 56 48 L56 52 M54 41 L54 45 M58 41 L58 45" stroke="#4d6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M68 41 C68 45, 64 45, 64 48 L64 52" stroke="#4d6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M56 52 L56 58 M64 52 L64 58" stroke="#4d6700" strokeWidth="1.5"/>
          
          {/* Ribbon block for RESIDUE FREE */}
          <rect x="10" y="60" width="100" height="22" rx="4" fill="#4d6700"/>
          <text x="60" y="74" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="Inter" textAnchor="middle" letterSpacing="0.06em">RESIDUE FREE</text>
          
          {/* Upper Text GLYPHOSATE */}
          <path id="upperPath" d="M22 46 A40 40 0 0 1 98 46" fill="none"/>
          <text fontSize="8.5" fontWeight="bold" fontFamily="Inter" fill="#4d6700" letterSpacing="0.08em">
            <textPath href="#upperPath" startOffset="50%" textAnchor="middle">
              GLYPHOSATE
            </textPath>
          </text>
          
          {/* Lower Text detoxproject.org */}
          <path id="lowerPath" d="M24 82 A40 40 0 0 0 96 82" fill="none"/>
          <text fontSize="6.5" fontWeight="extrabold" fontFamily="Inter" fill="#4d6700" letterSpacing="0.04em">
            <textPath href="#lowerPath" startOffset="50%" textAnchor="middle">
              detoxproject.org
            </textPath>
          </text>
        </svg>
      )
    },
    {
      title: "GMP Certified",
      desc: "Our facility follows internationally recognized standards for cleanliness, safety, and quality at every step of the manufacturing process.",
      // High-Fidelity GMP Circular Seal SVG
      svg: (
        <svg width="110" height="110" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto transform hover:rotate-6 transition-transform duration-500">
          <circle cx="60" cy="60" r="54" stroke="#4d6700" strokeWidth="2"/>
          <circle cx="60" cy="60" r="49" fill="#ffffff" stroke="#4d6700" strokeWidth="1"/>
          
          {/* Concentric rings */}
          <circle cx="60" cy="60" r="42" fill="#eaf3dc" stroke="#4d6700" strokeWidth="1.5" strokeDasharray="3 3"/>
          <circle cx="60" cy="60" r="32" stroke="#4d6700" strokeWidth="1"/>
          
          {/* GMP Text in Center */}
          <text x="60" y="69" fill="#4d6700" fontSize="24" fontWeight="900" fontFamily="Inter" textAnchor="middle" letterSpacing="-0.02em">GMP</text>
          
          {/* Upper Text CERTIFIED */}
          <path id="gmpUpperPath" d="M26 44 A36 36 0 0 1 94 44" fill="none"/>
          <text fontSize="8.5" fontWeight="bold" fontFamily="Inter" fill="#4d6700" letterSpacing="0.1em">
            <textPath href="#gmpUpperPath" startOffset="50%" textAnchor="middle">
              CERTIFIED
            </textPath>
          </text>
          
          {/* Lower Text CERTIFIED */}
          <path id="gmpLowerPath" d="M26 76 A36 36 0 0 0 94 76" fill="none"/>
          <text fontSize="8.5" fontWeight="bold" fontFamily="Inter" fill="#4d6700" letterSpacing="0.1em">
            <textPath href="#gmpLowerPath" startOffset="50%" textAnchor="middle">
              CERTIFIED
            </textPath>
          </text>
        </svg>
      )
    },
    {
      title: "FSSC 22000",
      desc: "A globally respected food safety certification that guarantees our processes, ingredients, and packaging meet the highest international standards for safe, quality food production.",
      // High-Fidelity Grey-Green FSSC Logo SVG
      svg: (
        <svg width="110" height="110" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto transform hover:rotate-6 transition-transform duration-500">
          <circle cx="60" cy="60" r="54" stroke="#dbdad7" strokeWidth="1.5"/>
          <circle cx="60" cy="60" r="49" fill="#ffffff"/>
          
          {/* FSSC Crescent swooshes */}
          <path d="M60 25 C40 25, 30 45, 35 65 C40 85, 60 95, 80 85 C83 83.5, 78 81, 75 82 C60 88, 48 80, 44 65 C40 50, 48 35, 65 35 C70 35, 78 37, 82 40 C80 37, 70 25, 60 25 Z" fill="#2d5f3e" opacity="0.85"/>
          <path d="M60 25 C75 25, 88 38, 92 55 C96 72, 88 88, 75 92 C68 94, 60 94, 52 90 C58 92, 68 90, 75 82 C82 74, 85 62, 82 50 C79 38, 70 28, 60 25 Z" fill="#7a8d80"/>
          
          {/* FSSC 22000 Text */}
          <text x="60" y="62" fill="#061907" fontSize="11" fontWeight="900" fontFamily="Inter" textAnchor="middle" letterSpacing="0.02em">FSSC 22000</text>
        </svg>
      )
    }
  ];

  return (
    <section id="certifications" className="bg-cream py-16 md:py-24 text-charcoal">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 text-center">
        
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#4d6700] mb-3 block">
            Scientific Sourcing
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5.5xl font-bold text-[#061907] tracking-tight leading-tight">
            Good Food Backed by Proof
          </h2>
          <div className="w-12 h-1 bg-[#4d6700] mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* 3 Certification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {certs.map((cert, idx) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white rounded-[16px] border border-[#061907]/5 p-8 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-md hover:border-forest/15 transition-all duration-300"
            >
              <div className="mb-6 h-32 flex items-center justify-center">
                {cert.svg}
              </div>
              <div>
                <h3 className="font-playfair font-bold text-[18px] md:text-[20px] text-[#061907] mb-3">
                  {cert.title}
                </h3>
                <p className="text-[12.5px] md:text-sm text-charcoal/70 leading-relaxed font-semibold">
                  {cert.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
