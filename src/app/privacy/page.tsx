"use client";

import React from "react";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { motion } from "framer-motion";

import { privacyPolicies } from "@/constants/policies";

export default function PrivacyPolicyPage() {

  return (
    <LandingLayout>
      <div className="storefront bg-cream text-charcoal min-h-screen py-16 md:py-24">
        <div className="max-w-[800px] mx-auto px-5 md:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-moss mb-3 block">
              Legal Agreement
            </span>
            <h1 className="text-4xl md:text-5.5xl font-playfair font-extrabold tracking-tight text-forest mb-6">
              Privacy Policy
            </h1>
            <p className="text-sm md:text-base text-charcoal/60 leading-relaxed font-semibold max-w-lg mx-auto">
              We value your trust and prioritize the protection of your personal information. 
              Read how we collect, store, and utilize your data.
            </p>
            <div className="w-12 h-1 bg-moss mx-auto mt-6 rounded-full" />
          </div>

          {/* Policy List */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 shadow-sm mb-16 space-y-10">
            {privacyPolicies.map((policy, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="border-l-2 border-forest/20 pl-6 hover:border-forest transition-colors duration-300"
              >
                <h2 className="text-xl font-playfair font-bold text-forest mb-3">
                  {policy.title}
                </h2>
                <p className="text-sm text-charcoal/70 leading-relaxed font-medium">
                  {policy.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Help Banner */}
          <div className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-forest border border-green-100">
                <Icon icon="lucide:shield-check" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-playfair text-lg font-bold text-forest mb-1">
                  Privacy Queries & Concerns
                </h3>
                <p className="text-xs text-charcoal/60 leading-relaxed font-medium">
                  Have questions about our GDPR compliance, data usage, or cookies policy?
                </p>
              </div>
            </div>
            <a
              href="mailto:hello@ramangreen.com"
              className="bg-forest text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-forest/90 transition-all duration-300 whitespace-nowrap cursor-pointer shadow-sm text-center"
            >
              Contact Sourcing Officer
            </a>
          </div>

        </div>
      </div>
    </LandingLayout>
  );
}
