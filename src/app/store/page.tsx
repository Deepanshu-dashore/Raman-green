"use client";

import React, { useState } from "react";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// In-store experiences data
const experiences = [
  {
    id: "consultation",
    title: "Wellness Consultation Corner",
    icon: "solar:health-bold-duotone",
    description: "Meet with our in-house certified Ayurvedic practitioners and nutritionists. Get personalized guidance, lifestyle recommendations, and tailored diet charts based on your body constitution (Prakriti).",
    bgImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    tag: "Ayurvedic Care"
  },
  {
    id: "bulk-bar",
    title: "Zero-Waste Bulk Seeds & Grains Bar",
    icon: "solar:leaf-bold-duotone",
    description: "Dispense your organic seeds, ancient grains, and dry foods in the exact quantity you need. Bring your own reusable glass jars, or use our biodegradable unbleached cotton bags and paper pouches.",
    bgImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    tag: "Zero Waste"
  },
  {
    id: "cold-press",
    title: "Live Wood-Pressed Oil Extraction",
    icon: "solar:water-drops-bold-duotone",
    description: "Observe the traditional wood-pressing (Lakdi Ghani) method. We cold-press locally sourced organic mustard, sesame, and groundnut seeds at low temperatures, preserving vital nutrients and rich aroma.",
    bgImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
    tag: "Live Demo"
  },
  {
    id: "tea-lounge",
    title: "Herbal Infusion & Tasting Lounge",
    icon: "solar:cup-hot-bold-duotone",
    description: "Slow down and enjoy a warm botanical infusion. Sample our organic herbal teas, roasted seeds mix, and ready-to-eat millet porridges prepared fresh daily at our stone-crafted tasting counter.",
    bgImage: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
    tag: "Free Tasting"
  }
];

// FAQs data
const faqs = [
  {
    question: "Where is the Raman Green Flagship Store located?",
    answer: "Our flagship store is located at Ground Floor, 12, Prithviraj Road, C-Scheme, Jaipur, Rajasthan 302001. We are situated in a quiet, green lane right next to Central Park's west gate."
  },
  {
    question: "Can I bring my own containers for the bulk seed bar?",
    answer: "Yes, absolutely! We encourage customers to bring their own clean jars, canisters, or bags. We will weigh your containers before you fill them (tare weight) so you only pay for the product. We also offer reusable organic cotton bags and glass jars for purchase."
  },
  {
    question: "Are all online products available in the physical store?",
    answer: "Yes, our entire catalog—including seasonal seeds, heritage crops, cold-pressed oils, dry fruits, and instant mixes—is fully stocked at our C-Scheme store. Additionally, in-store visitors have access to exclusive, small-batch seasonal harvests that are not available online."
  },
  {
    question: "How do I book a wellness consultation with your Ayurvedic experts?",
    answer: "Walk-ins are welcome for general queries, but we recommend scheduling an appointment for a detailed Ayurvedic constitution analysis (Prakriti Pariksha). You can call the store directly at +91 98765 43210 or email us at jaipurstore@ramangreen.com to reserve a slot."
  },
  {
    question: "Is parking available at the C-Scheme store?",
    answer: "Yes, we have dedicated front-of-house parking space for cars and two-wheelers, plus ample free roadside parking in our quiet residential lane."
  }
];

// Gallery Images
const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80",
    title: "Heritage Wood Shelves"
  },
  {
    url: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&q=80",
    title: "Wellness Apothecary"
  },
  {
    url: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600&q=80",
    title: "Organic Harvest Display"
  },
  {
    url: "https://images.unsplash.com/photo-1488459718432-010551724bf2?w=600&q=80",
    title: "Eco Dispensers"
  }
];

export default function StoreLocationPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeExp, setActiveExp] = useState(experiences[0].id);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <LandingLayout>
      <div className="storefront bg-cream text-charcoal min-h-screen">
        
        {/* 1. HERO SECTION */}
        <section className="relative h-[65vh] min-h-[450px] flex items-center justify-center overflow-hidden border-b border-charcoal/5">
          {/* Background image with high quality parallax/smooth cover */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&q=80"
              alt="Raman Green Flagship Store"
              className="w-full h-full object-cover brightness-[0.4]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-forest/30 to-black/30" />
          </div>

          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-16 text-center text-white flex flex-col items-center">
            <span className="inline-block px-3.5 py-1 bg-[#C9EC6F] text-forest text-[10px] font-black uppercase tracking-widest rounded-full mb-4 shadow-sm">
              Visit Us in Person
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7.5xl font-playfair font-extrabold tracking-tight mb-6 leading-tight drop-shadow-md text-cream">
              The Flagship Store
            </h1>
            <p className="text-sm md:text-lg max-w-2xl font-inter font-medium text-white/90 leading-relaxed drop-shadow-sm">
              Step into a physical sanctuary designed to reflect our profound connection to nature and wellness. Discover organic grains, wellness consultations, and heritage lifestyle.
            </p>
          </div>
          
          {/* Bottom Wave decoration */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 z-10 opacity-10">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] fill-cream">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35C25,36.42,52.37,45,79.82,51.62,143.21,67,209.87,71.06,321.39,56.44Z"></path>
            </svg>
          </div>
        </section>

        {/* 2. STORE METADATA GRID */}
        <section className="py-16 md:py-24 relative z-20 -mt-10">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Address Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm ambient-shadow flex flex-col justify-between group hover:border-forest/20 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-forest flex items-center justify-center shrink-0 group-hover:bg-forest group-hover:text-white transition-all duration-500 shadow-xs">
                    <Icon icon="solar:map-point-bold-duotone" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-playfair font-extrabold text-forest mb-3">Address</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Jaipur Flagship Store</p>
                    <p className="text-sm text-charcoal/80 font-semibold leading-relaxed">
                      Ground Floor, 12, Prithviraj Road,<br />
                      C-Scheme, Jaipur,<br />
                      Rajasthan, 302001
                    </p>
                  </div>
                </div>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-green-700 transition-colors uppercase tracking-wider"
                >
                  Get Directions
                  <Icon icon="solar:arrow-right-up-linear" className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Hours Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm ambient-shadow flex flex-col justify-between group hover:border-forest/20 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-forest flex items-center justify-center shrink-0 group-hover:bg-forest group-hover:text-white transition-all duration-500 shadow-xs">
                    <Icon icon="solar:clock-circle-bold-duotone" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-playfair font-extrabold text-forest mb-3">Operating Hours</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Open 7 Days a week</p>
                    <div className="space-y-1 text-sm text-charcoal/80 font-semibold">
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span>Monday - Sunday</span>
                        <span className="text-forest">10:00 AM - 9:00 PM</span>
                      </div>
                      <div className="flex justify-between py-1 text-charcoal/40 text-xs mt-1.5">
                        <span>* Holidays may affect hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-xs font-bold text-charcoal/45 uppercase tracking-wider">
                  Always Open For Nature
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm ambient-shadow flex flex-col justify-between group hover:border-forest/20 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-forest flex items-center justify-center shrink-0 group-hover:bg-forest group-hover:text-white transition-all duration-500 shadow-xs">
                    <Icon icon="solar:phone-calling-bold-duotone" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-playfair font-extrabold text-forest mb-3">Contact Details</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Get in touch directly</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">In-Store Helpline</p>
                        <a href="tel:+919876543210" className="text-sm text-charcoal hover:text-forest transition-colors font-bold mt-0.5 block">
                          +91 98765 43210
                        </a>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Store Email</p>
                        <a href="mailto:jaipurstore@ramangreen.com" className="text-sm text-charcoal hover:text-forest transition-colors font-bold mt-0.5 block">
                          jaipurstore@ramangreen.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <Link 
                  href="/contact" 
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-green-700 transition-colors uppercase tracking-wider"
                >
                  Send Online Message
                  <Icon icon="solar:letter-linear" className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* 3. IN-STORE EXPERIENCES */}
        <section className="py-16 md:py-24 bg-white border-t border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-forest uppercase tracking-widest bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                Interactive Showroom
              </span>
              <h2 className="text-3xl md:text-5xl font-playfair font-extrabold text-forest mt-4 mb-5">
                The In-Store Experience
              </h2>
              <p className="text-sm md:text-base text-charcoal/70 font-semibold leading-relaxed">
                Our store is more than just shelves. It is an interactive environment where you can connect deeply with organic food, learn about agricultural sourcing, and get personalized advice.
              </p>
            </div>

            {/* Experience Tabs and Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              
              {/* Left Side: Buttons list */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {experiences.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setActiveExp(exp.id)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 items-start ${
                      activeExp === exp.id
                        ? "bg-[#FAF9F6] border-forest/30 shadow-xs translate-x-2"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`p-3 rounded-xl shrink-0 transition-colors duration-300 ${
                      activeExp === exp.id
                        ? "bg-forest text-white"
                        : "bg-green-50 text-forest"
                    }`}>
                      <Icon icon={exp.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-playfair text-lg font-bold text-forest mb-1">
                        {exp.title}
                      </h4>
                      <span className="text-[10px] font-extrabold tracking-widest text-[#8FA382] uppercase">
                        {exp.tag}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Side: Showcase View */}
              <div className="lg:col-span-7 h-[450px] relative rounded-2xl overflow-hidden shadow-md border border-gray-100 group">
                <AnimatePresence mode="wait">
                  {experiences.map((exp) => exp.id === activeExp && (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col justify-end"
                    >
                      {/* Background Image */}
                      <img
                        src={exp.bgImage}
                        alt={exp.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.4]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/20 to-transparent" />
                      
                      {/* Text content */}
                      <div className="relative z-10 p-8 md:p-12 text-white">
                        <span className="bg-[#C9EC6F] text-forest text-[9px] font-black uppercase px-2.5 py-1 rounded tracking-widest mb-3 inline-block">
                          {exp.tag}
                        </span>
                        <h3 className="text-2xl md:text-3.5xl font-playfair font-extrabold text-cream mb-4 leading-tight">
                          {exp.title}
                        </h3>
                        <p className="text-xs md:text-sm text-white/85 font-medium leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </section>

        {/* 4. EDITORIAL MAP */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center">
              
              {/* Map Description */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <span className="text-xs font-bold text-forest uppercase tracking-widest">
                  Location Map
                </span>
                <h2 className="text-3xl md:text-4.5xl font-playfair font-extrabold text-forest mt-4 mb-6 leading-tight">
                  Located in the Heart of C-Scheme, Jaipur
                </h2>
                <p className="text-sm font-medium text-charcoal/70 leading-relaxed mb-5">
                  Raman Green is nestled in Jaipur's prime cultural and culinary district, C-Scheme. Surrounded by lush heritage parks and local artisanal cafes, our space is easily accessible from all directions of the Pink City.
                </p>
                <p className="text-sm font-medium text-charcoal/70 leading-relaxed mb-8">
                  We are positioned right near the historic west gate of Central Park, making it the perfect post-walk stop for organic seed mixes, wellness consults, and fresh extracts.
                </p>
                
                {/* Visual Location Landmarks */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-forest shrink-0">
                      <Icon icon="solar:routing-bold-duotone" className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-charcoal/80">2 mins walk from Central Park Gate 3</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-forest shrink-0">
                      <Icon icon="solar:routing-bold-duotone" className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-charcoal/80">5 mins drive from Panch Batti Crossing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-forest shrink-0">
                      <Icon icon="solar:routing-bold-duotone" className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-charcoal/80">15 mins drive from Jaipur Railway Station</span>
                  </div>
                </div>
              </div>

              {/* Styled SVG Map Panel */}
              <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden group">
                {/* Custom Stylized Editorial SVG Map */}
                <div className="w-full h-full absolute inset-0 bg-[#f9f8f6] opacity-90 transition-all duration-300 group-hover:bg-[#FAF9F6]" />
                
                {/* Stylized SVG Map Grid */}
                <svg
                  viewBox="0 0 400 250"
                  className="w-full h-full relative z-10 text-gray-200 max-w-[500px]"
                  style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
                >
                  {/* Green Park Curve / Central Park West Gate Mock */}
                  <path
                    d="M300,0 Q320,120 380,250"
                    fill="none"
                    stroke="#DCE8DE"
                    strokeWidth="45"
                    className="opacity-70"
                  />
                  <path
                    d="M300,0 Q320,120 380,250"
                    fill="none"
                    stroke="#C3DCD0"
                    strokeWidth="15"
                    className="opacity-80"
                  />

                  {/* Main Arterial Road (Prithviraj Road) */}
                  <path
                    d="M-20,130 L320,130 Q330,130 350,110 L420,50"
                    fill="none"
                    stroke="#EAE7E4"
                    strokeWidth="10"
                  />
                  
                  {/* Grid Lines/Secondary Roads */}
                  <line x1="80" y1="0" x2="80" y2="250" stroke="#FAF8F6" strokeWidth="6" />
                  <line x1="80" y1="0" x2="80" y2="250" stroke="#EAE7E4" strokeWidth="2" />
                  
                  <line x1="200" y1="0" x2="200" y2="250" stroke="#FAF8F6" strokeWidth="6" />
                  <line x1="200" y1="0" x2="200" y2="250" stroke="#EAE7E4" strokeWidth="2.5" />
                  
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#EAE7E4" strokeWidth="2" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#EAE7E4" strokeWidth="2" />

                  {/* Map Labels for context */}
                  <text x="350" y="80" fill="#8FA382" fontSize="7" fontWeight="bold" letterSpacing="0.1em" className="font-inter opacity-80 uppercase select-none" transform="rotate(78 350 80)">Central Park</text>
                  <text x="120" y="122" fill="#2C2C2C" fontSize="6.5" fontWeight="bold" letterSpacing="0.05em" className="font-inter opacity-40 uppercase select-none">Prithviraj Road</text>
                  <text x="12" y="52" fill="#2C2C2C" fontSize="6" fontWeight="bold" letterSpacing="0.05em" className="font-inter opacity-30 uppercase select-none">C-Scheme</text>

                  {/* Pulsing glow ring for Main Pin */}
                  <circle cx="160" cy="130" r="16" fill="none" stroke="#1B3022" strokeWidth="1" className="opacity-20 animate-ping" style={{ transformOrigin: "160px 130px", animationDuration: "3.5s" }} />
                  <circle cx="160" cy="130" r="8" fill="none" stroke="#1B3022" strokeWidth="2" className="opacity-40 animate-pulse" />
                </svg>

                {/* Main Interactive Floating Pin & Tag Container */}
                <div className="absolute top-[52%] left-[40%] z-20 flex flex-col items-center select-none translate-y-[-50%] translate-x-[-50%] pointer-events-auto">
                  {/* Glowing Marker */}
                  <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white">
                    <Icon icon="solar:map-point-bold-duotone" className="w-5.5 h-5.5" />
                  </div>

                  {/* Map Label Tag */}
                  <div className="mt-3 bg-forest text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow-md border border-white/10 tracking-wider whitespace-nowrap uppercase transform translate-y-0 group-hover:translate-y-[-2px] transition-transform duration-300">
                    Raman Green Store
                  </div>
                </div>

                {/* Scale Indicator */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-black text-charcoal/50 uppercase tracking-widest">
                  <span className="w-4 h-0.5 bg-charcoal/30 inline-block"></span>
                  <span>500 m</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 5. VISUAL GALLERY */}
        <section className="py-16 md:py-24 bg-white border-t border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-forest uppercase tracking-widest">
                Store Gallery
              </span>
              <h2 className="text-3xl md:text-5xl font-playfair font-extrabold text-forest mt-4 mb-5">
                Visual Walkthrough
              </h2>
              <p className="text-sm md:text-base text-charcoal/70 font-semibold leading-relaxed">
                Take a virtual tour of our modern apothecary space, built with eco-friendly wood, stone fixtures, and recycled botanical installations.
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden aspect-square shadow-sm group border border-gray-100">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5" />
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-forest shadow-sm opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 border border-gray-100">
                    {img.title}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 6. FAQ SECTION (Interactive Accordions) */}
        <section className="py-16 md:py-24 max-w-[800px] mx-auto px-5">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-forest uppercase tracking-widest">
              Store FAQ
            </span>
            <h2 className="text-3xl md:text-4.5xl font-playfair font-extrabold text-forest mt-4 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xs md:text-sm text-charcoal/50 leading-relaxed font-semibold">
              Find answers to quick questions regarding your upcoming visit to our flagship store.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer outline-none focus:outline-none"
                >
                  <h3 className="font-playfair text-base md:text-lg font-bold text-forest pr-4">
                    {faq.question}
                  </h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-gray-100 transition-all duration-300 ${
                    openFaq === index ? "bg-forest text-white rotate-180" : "bg-gray-50 text-gray-400"
                  }`}>
                    <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-charcoal/70 leading-relaxed font-semibold border-t border-gray-50/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* 7. CALL TO ACTION */}
        <section className="bg-forest text-cream py-16 md:py-24 text-center relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-forest via-[#112016] to-[#0b160e] opacity-90 z-0" />
          
          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-16 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-playfair font-extrabold text-cream mb-6">
              Can't Visit Us in Person?
            </h2>
            <p className="text-sm md:text-base text-cream/70 max-w-xl font-medium leading-relaxed mb-8">
              Explore our full organic catalog online. We harvest, package, and ship our premium seeds, crops, and dry fruits directly to your doorstep anywhere in India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="bg-[#C9EC6F] hover:bg-[#bce05c] text-forest text-xs font-bold uppercase tracking-wider py-4 px-10 rounded-xl transition-all duration-300 shadow-md cursor-pointer"
              >
                Shop Online Store
              </Link>
              <Link
                href="/contact"
                className="bg-transparent border border-cream/20 hover:border-cream text-cream text-xs font-bold uppercase tracking-wider py-4 px-10 rounded-xl transition-all duration-300 cursor-pointer"
              >
                Contact Customer Support
              </Link>
            </div>
          </div>
        </section>

      </div>
    </LandingLayout>
  );
}
