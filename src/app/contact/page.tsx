"use client";

import React, { useState } from "react";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      toast.success("Message sent successfully! We will get back to you soon.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      });
      setIsSubmitting(false);
    }, 1200);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <LandingLayout>
      <div className="storefront bg-cream py-16 md:py-24 text-charcoal">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16">
          
          {/* Header section - Get in Touch */}
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <h1 className="text-4xl md:text-5.5xl font-playfair font-extrabold tracking-tight text-forest mb-6">
              Get in Touch
            </h1>
            <p className="text-sm md:text-base text-charcoal/70 leading-relaxed font-medium">
              We cultivate relationships as carefully as we cultivate our crops. Whether 
              you're inquiring about wholesale, product origins, or simply want to say hello, 
              we're here to listen.
            </p>
          </div>

          {/* Form & Info Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch mb-20 md:mb-28">
            
            {/* Left Column: Form Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm ambient-shadow flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-playfair font-extrabold text-forest mb-8">
                  Send a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-charcoal/50 uppercase tracking-widest">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-charcoal font-semibold focus:border-forest transition-colors outline-none focus:ring-0 focus:outline-none"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-charcoal/50 uppercase tracking-widest">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-charcoal font-semibold focus:border-forest transition-colors outline-none focus:ring-0 focus:outline-none"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-charcoal/50 uppercase tracking-widest">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-charcoal font-semibold focus:border-forest transition-colors outline-none focus:ring-0 focus:outline-none"
                      placeholder="hello@example.com"
                      required
                    />
                  </div>

                  {/* Subject Dropdown */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-[11px] font-bold text-charcoal/50 uppercase tracking-widest">
                      Subject
                    </label>
                    <div className="relative">
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-charcoal font-semibold focus:border-forest transition-colors outline-none appearance-none focus:ring-0 focus:outline-none cursor-pointer pr-10"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Wholesale & Bulk Orders">Wholesale & Bulk Orders</option>
                        <option value="Product Origin & Sourcing">Product Origin & Sourcing</option>
                        <option value="Career Opportunities">Career Opportunities</option>
                        <option value="Other Inquiries">Other Inquiries</option>
                      </select>
                      <Icon
                        icon="solar:alt-arrow-down-linear"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-charcoal/50 uppercase tracking-widest">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-charcoal font-semibold focus:border-forest transition-colors outline-none resize-none focus:ring-0 focus:outline-none"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-forest text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-forest/90 transition-all duration-300 shadow-sm cursor-pointer disabled:opacity-70 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Info & Photo */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              {/* Direct Contact Card */}
              <div className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-8 md:p-10 flex flex-col justify-center shadow-sm">
                <h3 className="text-xl md:text-2xl font-playfair font-extrabold text-forest mb-6">
                  Direct Contact
                </h3>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-forest">
                      <Icon icon="solar:letter-linear" className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Email Support</p>
                      <a href="mailto:hello@ramangreen.com" className="text-charcoal font-bold hover:text-forest transition-colors mt-0.5 block">
                        hello@ramangreen.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-forest">
                      <Icon icon="solar:phone-calling-linear" className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Phone (Mon-Fri, 9am-5pm EST)</p>
                      <a href="tel:+18005550199" className="text-charcoal font-bold hover:text-forest transition-colors mt-0.5 block">
                        +1 (800) 555-0199
                      </a>
                    </div>
                  </div>

                  {/* Headquarters Address */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-forest">
                      <Icon icon="solar:map-point-linear" className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Heritage Farm & Headquarters</p>
                      <p className="text-charcoal font-bold mt-0.5 leading-relaxed">
                        1240 Botanical Way<br />
                        Portland, OR 97205
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-16/10 flex-1 min-h-[220px] group border border-gray-100">
                <Image
                  src="/headquarters_farm.png"
                  alt="Global Headquarters & Heritage Farm"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-forest shadow-sm border border-gray-100">
                  <Icon icon="solar:shop-2-bold-duotone" className="w-4 h-4 shrink-0" />
                  <span>Global Headquarters & Heritage Farm</span>
                </div>
              </div>

            </div>

          </div>

          {/* Staggered Farm Section */}
          <div className="mt-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-playfair font-extrabold text-forest mb-4">
                Visit Our Farm
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Tonal Panel */}
              <div className="md:col-span-3 rounded-2xl overflow-hidden border border-gray-100 relative min-h-[250px] md:min-h-auto group shadow-sm bg-[#e4e2e1]/30">
                <Image
                  src="/botanical_crop_warm.png"
                  alt="Organic Crop Textures"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.98]"
                />
                <div className="absolute inset-0 bg-forest/5 mix-blend-overlay" />
              </div>

              {/* Middle Interactive SVG Map Panel */}
              <div className="md:col-span-6 bg-white border border-gray-100 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden group">
                {/* Custom Stylized Editorial SVG Map */}
                <div className="w-full h-full absolute inset-0 bg-[#f9f8f6] opacity-90 transition-all duration-300 group-hover:bg-[#FAF9F6]" />
                
                {/* Stylized SVG Map Grid */}
                <svg
                  viewBox="0 0 400 250"
                  className="w-full h-full relative z-10 text-gray-200 max-w-[500px]"
                  style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
                >
                  {/* Subtle River/Nature Curve */}
                  <path
                    d="M-50,180 Q100,200 220,120 T450,50"
                    fill="none"
                    stroke="#DCE8DE"
                    strokeWidth="12"
                    className="opacity-70"
                  />
                  <path
                    d="M-50,180 Q100,200 220,120 T450,50"
                    fill="none"
                    stroke="#C3DCD0"
                    strokeWidth="4"
                    className="opacity-80"
                  />

                  {/* Grid Lines/Roads */}
                  <line x1="20" y1="0" x2="60" y2="250" stroke="#EAE7E4" strokeWidth="2.5" />
                  <line x1="120" y1="0" x2="110" y2="250" stroke="#EAE7E4" strokeWidth="2.5" />
                  <line x1="280" y1="0" x2="290" y2="250" stroke="#EAE7E4" strokeWidth="3" />
                  <line x1="350" y1="0" x2="330" y2="250" stroke="#EAE7E4" strokeWidth="2" />
                  
                  <line x1="0" y1="40" x2="400" y2="50" stroke="#EAE7E4" strokeWidth="2.5" />
                  <line x1="0" y1="110" x2="400" y2="90" stroke="#EAE7E4" strokeWidth="3" />
                  <line x1="0" y1="180" x2="400" y2="200" stroke="#EAE7E4" strokeWidth="2" />

                  {/* Topography Contour Lines (subtle) */}
                  <path d="M 50,30 Q 80,45 100,20" fill="none" stroke="#E5E0DB" strokeWidth="1" strokeDasharray="3,3" />
                  <path d="M 320,140 Q 360,170 380,130" fill="none" stroke="#E5E0DB" strokeWidth="1" strokeDasharray="3,3" />
                  <path d="M 40,210 Q 70,230 110,210" fill="none" stroke="#E5E0DB" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Secondary Markers */}
                  <circle cx="95" cy="65" r="3" fill="#8FA382" className="opacity-60" />
                  <circle cx="310" cy="165" r="3" fill="#8FA382" className="opacity-60" />
                  <circle cx="150" cy="145" r="2.5" fill="#8FA382" className="opacity-60" />

                  {/* Pulsing glow ring for Main Pin */}
                  <circle cx="200" cy="100" r="16" fill="none" stroke="#1B3022" strokeWidth="1" className="opacity-20 animate-ping" style={{ transformOrigin: "200px 100px", animationDuration: "3s" }} />
                  <circle cx="200" cy="100" r="8" fill="none" stroke="#1B3022" strokeWidth="2" className="opacity-40 animate-pulse" />
                </svg>

                {/* Main Interactive Floating Pin & Tag Container */}
                <div className="absolute top-[34%] left-[46%] z-20 flex flex-col items-center select-none translate-y-[-50%] translate-x-[-50%] pointer-events-auto">
                  {/* Glowing Marker */}
                  <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white">
                    <Icon icon="solar:map-point-bold-duotone" className="w-5.5 h-5.5" />
                  </div>

                  {/* Map Label Tag */}
                  <div className="mt-3.5 bg-forest text-white text-[11px] font-bold py-2 px-4 rounded-lg shadow-md border border-white/10 tracking-wider whitespace-nowrap uppercase transform translate-y-0 group-hover:translate-y-[-2px] transition-transform duration-300">
                    Raman Green Farm
                  </div>
                </div>

                {/* Minimalist Scale Indicator */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-black text-charcoal/50 uppercase tracking-widest">
                  <span className="w-6 h-0.5 bg-charcoal/30 inline-block"></span>
                  <span>1 km</span>
                </div>
              </div>

              {/* Right Tonal Panel */}
              <div className="md:col-span-3 rounded-2xl border border-gray-100 p-8 flex flex-col justify-center items-center text-center shadow-sm bg-[#E4E2D1]/25 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#e4e2e1]/10 opacity-30 group-hover:opacity-45 transition-opacity" />
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-forest mb-4 relative z-10 border border-gray-50">
                  <Icon icon="solar:bookmark-double-minimalistic-bold-duotone" className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-playfair font-extrabold text-forest mb-2 relative z-10">
                  Organic Sanctuary
                </h4>
                <p className="text-xs text-charcoal/70 leading-relaxed font-semibold max-w-[180px] relative z-10">
                  A carefully cultivated ecosystem direct from our agricultural heritage.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </LandingLayout>
  );
}
