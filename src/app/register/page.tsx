"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import LandingLayout from "@/components/landing/LandingLayout";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.data) {
          router.push(redirectUrl);
        }
      } catch (err) {
        // Not logged in
      }
    };
    checkAuth();
  }, [router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      toast.error("Name, phone, and password are required.");
      return;
    }

    setLoading(true);

    try {
      // Create user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
          password: formData.password,
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Account created successfully! Signing you in...");

        // Auto-login after registration
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: formData.phone,
            password: formData.password,
          }),
        });

        const loginJson = await loginRes.json();

        if (loginJson.success) {
          localStorage.setItem("rg-user", JSON.stringify(loginJson.data.user));
          window.location.href = redirectUrl;
        } else {
          // If auto-login fails, redirect to login page
          router.push(`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`);
        }
      } else {
        toast.error(json.message || "Registration failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(27,48,34,0.06)] border border-gray-100/80 flex flex-col md:flex-row min-h-[600px]">
      {/* Left Column: Natural Brand Side */}
      <div className="relative hidden md:flex md:w-[48%] flex-col justify-between p-10 text-white overflow-hidden bg-forest">
        <Image
          src="/watercolor_leaves.png"
          alt="Natural leaves background"
          fill
          priority
          className="object-cover opacity-25 mix-blend-lighten scale-105 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/30 via-forest/85 to-forest z-0" />

        <div className="relative z-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Raman Green"
              width={130}
              height={60}
              className="h-12 w-auto object-contain brightness-0 invert opacity-90"
            />
          </Link>
        </div>

        <div className="relative z-10 my-auto pt-10">
          <span className="text-[10px] font-black tracking-[0.3em] text-[#47C269] uppercase block mb-3">
            Join the Wellness Heritage
          </span>
          <h2 className="text-3xl font-playfair font-bold leading-tight mb-4 text-[#F9F7F2]">
            Start Your Journey with Raman Green
          </h2>
          <div className="w-12 h-1 bg-[#47C269] rounded-full mb-6"></div>
          <p className="text-xs text-cream/70 font-semibold leading-relaxed max-w-xs">
            Create an account to track shipments, checkout faster, receive seasonal organic recipe guides and member-exclusive offers.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold text-cream/50 tracking-wider uppercase">
          <Icon icon="solar:shield-check-bold-duotone" className="w-4.5 h-4.5 text-[#47C269]" />
          <span>Sourced Responsibly & Sustainably</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full md:w-[52%] p-8 md:p-12 flex flex-col justify-center bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo Display */}
          <div className="flex md:hidden justify-center mb-8">
            <Image
              src="/logo.png"
              alt="Raman Green Logo"
              width={140}
              height={70}
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-playfair font-extrabold text-forest tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-xs text-gray-400 font-semibold">
              Fill in the details to register as a customer
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Full Name
              </label>
              <div className="relative flex items-center group">
                <Icon
                  icon="solar:user-linear"
                  className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
                />
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#47C269] focus:ring-4 focus:ring-[#47C269]/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400/80"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Phone Number
              </label>
              <div className="relative flex items-center group">
                <Icon
                  icon="solar:phone-calling-linear"
                  className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#47C269] focus:ring-4 focus:ring-[#47C269]/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400/80"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email Address Input (Optional) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Email Address <span className="text-gray-400/60 lowercase font-medium">(optional)</span>
              </label>
              <div className="relative flex items-center group">
                <Icon
                  icon="solar:letter-linear"
                  className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
                />
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#47C269] focus:ring-4 focus:ring-[#47C269]/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400/80"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Password
              </label>
              <div className="relative flex items-center group">
                <Icon
                  icon="solar:lock-linear"
                  className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  required
                  className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#47C269] focus:ring-4 focus:ring-[#47C269]/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400/80"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"}
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-forest text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-forest/90 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none transition-all flex items-center justify-between cursor-pointer group"
              >
                {loading ? (
                  <div className="mx-auto flex items-center gap-2">
                    <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <>
                    <span className="flex-grow text-center pl-6">Register</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1 shrink-0">
                      <Icon icon="solar:arrow-right-linear" className="w-4.5 h-4.5 text-white" />
                    </div>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Direct link to Login */}
          <div className="mt-6 text-center text-xs font-semibold text-gray-500">
            <span>Already have an account? </span>
            <Link
              href={`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-[#47C269] hover:text-[#3eac5c] hover:underline font-extrabold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <LandingLayout>
      <div className="storefront bg-cream py-16 md:py-24 text-charcoal min-h-[calc(100vh-100px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl flex justify-center"
        >
          <Suspense fallback={
            <div className="w-full max-w-4xl bg-white rounded-3xl p-12 shadow-md flex items-center justify-center min-h-[600px]">
              <Icon icon="mdi:loading" className="animate-spin text-forest w-10 h-10" />
            </div>
          }>
            <RegisterForm />
          </Suspense>
        </motion.div>
      </div>
    </LandingLayout>
  );
}
