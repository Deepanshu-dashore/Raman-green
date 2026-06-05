"use client";

import React, { useState } from "react";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

import { pillars, timelineSteps, tabs } from "@/constants/about";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("roots");

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <LandingLayout>
      <div className="storefront bg-cream text-charcoal min-h-screen">
        {/* Hero Banner Section */}
        <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden flex items-center justify-center">
          <Image
            src="/dry_herbs_hero.png"
            alt="Organic green crops fields"
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-95"
          />
          {/* Rich Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/50 to-forest/85" />
          
          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-16 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <span className="inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-[0.2em] text-forest bg-sage mb-4 md:mb-6 shadow-sm">
                About Raman Green
              </span>
              <h1 className="font-playfair text-4xl md:text-6.5xl font-extrabold tracking-tight leading-tight mb-4 md:mb-6">
                Rooted in Heritage.<br />Cultivated for Wellness.
              </h1>
              <p className="font-inter text-sm md:text-lg text-cream/85 max-w-xl mx-auto leading-relaxed">
                Bridging traditional agricultural wisdom with modern scientific transparency
                to bring you the world’s purest organic crops.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pillars / Philosophy Grid */}
        <section className="py-20 md:py-28 bg-[#FAF9F6] border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-moss mb-3 block">
                Our Foundation
              </span>
              <h2 className="text-3xl md:text-4.5xl font-playfair font-extrabold text-forest mb-4">
                What We Stand For
              </h2>
              <div className="w-12 h-1 bg-moss mx-auto mt-4 rounded-full" />
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {pillars.map((pillar, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm ambient-shadow hover:shadow-md hover:border-forest/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
                >
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-forest mb-6 border border-green-100/50">
                    <Icon icon={pillar.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-forest mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-xs md:text-sm text-charcoal/70 leading-relaxed font-semibold">
                    {pillar.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Sourcing Timeline - Staggered Story */}
        <section className="py-20 md:py-28 bg-white overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-moss mb-3 block">
                The Sourcing Cycle
              </span>
              <h2 className="text-3xl md:text-4.5xl font-playfair font-extrabold text-forest mb-4">
                From Soil to Table
              </h2>
              <p className="text-xs md:text-sm text-charcoal/60 leading-relaxed font-semibold">
                Trace our meticulously monitored steps from selecting native seeds to
                delivering verified organic products to your home.
              </p>
              <div className="w-12 h-1 bg-moss mx-auto mt-4 rounded-full" />
            </div>

            <div className="space-y-16 md:space-y-24 relative">
              {/* Connecting line in desktop */}
              <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-gray-100 -translate-x-1/2 hidden lg:block" />

              {timelineSteps.map((step, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                      isEven ? "" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Image Column */}
                    <div className="w-full lg:w-1/2">
                      <div className="relative rounded-2xl overflow-hidden aspect-16/10 shadow-sm border border-gray-100 group">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 45vw"
                          className="object-cover group-hover:scale-103 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-forest/5 mix-blend-overlay" />
                      </div>
                    </div>

                    {/* Text Column */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-sage text-forest text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                          {step.year}
                        </span>
                        <div className="h-px bg-gray-200 flex-1 lg:hidden" />
                      </div>
                      <h3 className="font-playfair text-2xl md:text-3xl font-extrabold text-forest mb-4">
                        {step.title}
                      </h3>
                      <p className="text-sm md:text-base text-charcoal/70 leading-relaxed font-medium">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tab Switcher - Narrative Detail */}
        <section className="py-20 md:py-28 bg-[#FAF9F6] border-t border-b border-gray-100">
          <div className="max-w-[1024px] mx-auto px-5 md:px-12">
            
            {/* Tabs Headings */}
            <div className="flex border-b border-gray-200 gap-1.5 md:gap-4 justify-center md:justify-start overflow-x-auto no-scrollbar mb-12">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "border-forest text-forest font-black"
                        : "border-transparent text-charcoal/40 hover:text-charcoal/70"
                    }`}
                  >
                    <Icon icon={tab.icon} className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 shadow-sm ambient-shadow min-h-[250px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {tabs.map((tab) => {
                    if (tab.id !== activeTab) return null;
                    return (
                      <div key={tab.id}>
                        <h3 className="font-playfair text-2xl md:text-3.5xl font-extrabold text-forest mb-6">
                          {tab.title}
                        </h3>
                        {tab.content}
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </section>

        {/* Certification Seal Strip (Scientific Proof) */}
        <section className="py-16 md:py-24 bg-white text-center">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#4d6700] mb-3 block">
              Certified Safety
            </span>
            <h2 className="font-playfair text-3xl font-bold text-[#061907] mb-12">
              Accredited Organics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center border border-forest/10 shadow-xs">
                  <Icon icon="lucide:sprout" className="w-10 h-10 text-forest" />
                </div>
                <span className="text-[10px] font-bold text-forest uppercase tracking-wider">USDA Organic</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center border border-forest/10 shadow-xs">
                  <Icon icon="lucide:shield-check" className="w-10 h-10 text-forest" />
                </div>
                <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Glyphosate Free</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center border border-forest/10 shadow-xs">
                  <Icon icon="lucide:award" className="w-10 h-10 text-forest" />
                </div>
                <span className="text-[10px] font-bold text-forest uppercase tracking-wider">GMP Certified</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center border border-forest/10 shadow-xs">
                  <Icon icon="lucide:badge-check" className="w-10 h-10 text-forest" />
                </div>
                <span className="text-[10px] font-bold text-forest uppercase tracking-wider">FSSC 22000 Approved</span>
              </div>
            </div>
          </div>
        </section>

        {/* Wholesale & Sourcing CTA Banner */}
        <section className=" text-white py-16 md:py-24 md:pb-36 relative overflow-hidden">
          {/* Subtle natural texture backdrop */}
          <div className="absolute inset-0 bg-forest/70 z-10"></div>
          <div className="absolute inset-0 ">
            <Image
              src="/botanical_crop_warm.png"
              alt="Farm texture background"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="font-playfair text-3xl md:text-4.5xl font-extrabold mb-6">
                Wholesale & Bulk Partnerships
              </h2>
              <p className="font-inter text-sm md:text-base text-cream/70 leading-relaxed mb-8">
                Are you an artisan baker, high-quality food brand, or herbal distributor? 
                We partner with institutional clients worldwide to deliver verified, glyphosate-free, 
                premium raw botanical ingredients in bulk.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact?subject=Wholesale%20%26%20Bulk%20Orders"
                  className="bg-white text-forest text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-cream transition-all duration-300 shadow-sm"
                >
                  Wholesale Inquiries
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent border border-white/20 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-xl transition-all duration-300"
                >
                  Contact Our Sourcing Team
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}
