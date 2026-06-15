"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import LandingLayout from "@/components/landing/LandingLayout";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [formData, setFormData] = useState({
    identifier: "",
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
        // Not logged in, stay on page
      }
    };
    checkAuth();
  }, [router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Welcome back! Login successful.");
        // Store user in localstorage for instant client state sync if needed
        localStorage.setItem("rg-user", JSON.stringify(json.data.user));
        // Force refresh to update Navbar/Layout state
        window.location.href = redirectUrl;
      } else {
        toast.error(json.message || "Invalid credentials.");
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
            Pure & Organic
          </span>
          <h2 className="text-3xl font-playfair font-bold leading-tight mb-4 text-[#F9F7F2]">
            Cultivating Heritage, Defining Wellness
          </h2>
          <div className="w-12 h-1 bg-[#47C269] rounded-full mb-6"></div>
          <p className="text-xs text-cream/70 font-semibold leading-relaxed max-w-xs">
            Sign in to access your orders, saved items, and personalized organic wellness recommendations.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold text-cream/50 tracking-wider uppercase">
          <Icon icon="solar:shield-check-bold-duotone" className="w-4.5 h-4.5 text-[#47C269]" />
          <span>100% Secure Shopping</span>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
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

          <div className="mb-8">
            <h1 className="text-2xl font-playfair font-extrabold text-forest tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-xs text-gray-400 font-semibold">
              Please sign in to your customer account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone/Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Phone Number or Email
              </label>
              <div className="relative flex items-center group">
                <Icon
                  icon="solar:user-linear"
                  className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
                />
                <input
                  type="text"
                  placeholder="Enter phone or email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#47C269] focus:ring-4 focus:ring-[#47C269]/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400/80"
                  value={formData.identifier}
                  onChange={(e) =>
                    setFormData({ ...formData, identifier: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.success("Password recovery is available via Customer Support.")}
                  className="text-[10px] text-[#47C269] hover:underline font-bold"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative flex items-center group">
                <Icon
                  icon="solar:lock-linear"
                  className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#47C269] focus:ring-4 focus:ring-[#47C269]/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400/80"
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

            {/* Remember Me */}
            <div className="flex items-center text-xs font-bold text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest cursor-pointer"
                  defaultChecked
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-forest/90 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none transition-all flex items-center justify-between cursor-pointer group"
            >
              {loading ? (
                <div className="mx-auto flex items-center gap-2">
                  <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span className="flex-grow text-center pl-6">Sign In</span>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1 shrink-0">
                    <Icon icon="solar:arrow-right-linear" className="w-4.5 h-4.5 text-white" />
                  </div>
                </>
              )}
            </button>
          </form>

          {/* Direct link to Register */}
          <div className="mt-8 text-center text-xs font-semibold text-gray-500">
            <span>New to Raman Green? </span>
            <Link
              href={`/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-[#47C269] hover:text-[#3eac5c] hover:underline font-extrabold transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
            <LoginForm />
          </Suspense>
        </motion.div>
      </div>
    </LandingLayout>
  );
}
