"use client";

import React from "react";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { motion } from "framer-motion";

import { returnsSections } from "@/constants/policies";

export default function ReturnsPolicyPage() {

  return (
    <LandingLayout>
      <div className="storefront bg-cream text-charcoal min-h-screen py-16 md:py-24">
        <div className="max-w-[800px] mx-auto px-5 md:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-moss mb-3 block">
              Customer Support
            </span>
            <h1 className="text-4xl md:text-5.5xl font-playfair font-extrabold tracking-tight text-forest mb-6">
              Return & Refund Policy
            </h1>
            <p className="text-sm md:text-base text-charcoal/60 leading-relaxed font-semibold max-w-lg mx-auto">
              We stand behind the quality of our harvests. Learn about our guidelines for replacements, 
              refunds, and damaged goods.
            </p>
            <div className="w-12 h-1 bg-moss mx-auto mt-6 rounded-full" />
          </div>

          {/* Policy Cards */}
          <div className="space-y-6 mb-16">
            {returnsSections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-gray-50 flex items-center justify-center shrink-0 text-forest">
                  <Icon icon={section.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-playfair font-bold text-forest mb-2">
                    {section.title}
                  </h2>
                  <p className="text-sm text-charcoal/70 leading-relaxed font-medium">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Sourcing / Return Assistance */}
          <div className="bg-forest text-white rounded-2xl p-8 text-center relative overflow-hidden shadow-sm">
            <div className="relative z-10 max-w-xl mx-auto">
              <h3 className="font-playfair text-2xl font-bold mb-4">
                Need Help with your Order?
              </h3>
              <p className="text-xs md:text-sm text-cream/70 leading-relaxed font-medium mb-6">
                Our support team is available Monday through Friday, 9:00 AM to 5:00 PM. 
                Please have your order number ready so we can assist you promptly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  href="/contact"
                  className="bg-white text-forest text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-cream transition-all duration-300 w-full sm:w-auto"
                >
                  Contact Support
                </Link>
                <a
                  href="mailto:hello@ramangreen.com"
                  className="text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  Email hello@ramangreen.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </LandingLayout>
  );
}
