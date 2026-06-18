"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import LandingLayout from "@/components/landing/LandingLayout";

import { get, post } from "@/lib/axios";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { isValidEmail, isValidPhone, isValidPassword } from "@/app/lib/utils/sanitize";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Google sign-in modal states
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState<"choose" | "phone" | "custom">("choose");
  const [googleUser, setGoogleUser] = useState({ name: "", email: "", phone: "" });
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const json = await get<any>("/api/auth/me");
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
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!name || !phone || !email || !password) {
      toast.error("Name, phone, email, and password are required.");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Create user
      await post<any>("/api/auth/register", {
        name,
        phone,
        email,
        password,
      });

      toast.success("Account created successfully! Please log in to continue.");
      router.push(`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`);
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelect = async (name: string, email: string) => {
    setGoogleLoading(true);
    setGoogleUser((prev) => ({ ...prev, name, email }));
    try {
      const json = await post<any>("/api/auth/google", { name, email });
      if (json.data && json.data.phoneRequired) {
        setGoogleStep("phone");
      } else {
        toast.success("Signed in with Google successfully!");
        dispatch(setCredentials({ user: json.data.user, token: json.data.token }));
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      toast.error(err.message || "Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    const phone = googleUser.phone.trim();
    if (!phone) {
      toast.error("Phone number is required.");
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    setGoogleLoading(true);
    try {
      const json = await post<any>("/api/auth/google", {
        name: googleUser.name,
        email: googleUser.email,
        phone,
      });
      toast.success("Welcome! Account created and logged in successfully.");
      dispatch(setCredentials({ user: json.data.user, token: json.data.token }));
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error(err.message || "Failed to complete Google registration.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Floating Card */}
      <div className="w-full bg-white rounded-[32px] border border-gray-100 p-8 md:p-10 shadow-[0_20px_50px_rgba(27,48,34,0.04)]">
        <h3 className="text-2xl md:text-3xl font-playfair font-extrabold text-forest text-center tracking-tight mb-2">
          Create Account
        </h3>
        <p className="text-xs text-gray-400 font-semibold text-center leading-relaxed mb-6">
          Sign up to enjoy fresh organic wellness direct from farms.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-charcoal/80 mb-2 pl-1">
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
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-charcoal/80 mb-2 pl-1">
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
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-charcoal/80 mb-2 pl-1">
              Email Address
            </label>
            <div className="relative flex items-center group">
              <Icon
                icon="solar:letter-linear"
                className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-[#47C269] transition-colors"
              />
              <input
                type="email"
                placeholder="john@example.com"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#1b3022] mb-2 pl-1">
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
                className="w-full pl-11 pr-11 py-2.5 bg-white border border-gray-200 rounded-xl focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/5 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
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

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-center text-xs font-semibold text-gray-500 mt-4 pl-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                className="w-4.5 h-4.5 rounded border-gray-300 text-forest focus:ring-forest cursor-pointer"
                defaultChecked
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-[#47C269] hover:underline font-bold">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#47C269] hover:underline font-bold">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1b3022] hover:bg-[#122017] text-white py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer group shadow-sm mt-6"
          >
            {loading ? (
              <div className="mx-auto flex items-center gap-2">
                <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span className="flex-grow text-center pl-6">Register</span>
                <Icon icon="solar:arrow-right-linear" className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Google Sign-in Modal */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Icon icon="flat-color-icons:google" className="w-5.5 h-5.5" />
                <span className="text-sm font-bold text-gray-700">Sign in with Google</span>
              </div>
              <button
                onClick={() => setGoogleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <Icon icon="solar:close-square-linear" className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {googleStep === "choose" && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 font-semibold text-center mb-2">
                    Choose an account to continue to Raman Green
                  </p>

                  {/* Account List */}
                  <div className="space-y-2">
                    {[
                      { name: "Deepanshu Dashore", email: "deepanshu.dashore@gmail.com", avatar: "D" },
                      { name: "Raman Green Dev", email: "dev.ramangreen@gmail.com", avatar: "R" },
                    ].map((acc) => (
                      <button
                        key={acc.email}
                        disabled={googleLoading}
                        onClick={() => handleGoogleSelect(acc.name, acc.email)}
                        className="w-full flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-slate-50 hover:border-gray-200 transition-all text-left group cursor-pointer disabled:opacity-50"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#1b3022] text-white flex items-center justify-center font-bold text-sm">
                          {acc.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 group-hover:text-forest transition-colors">
                            {acc.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate font-medium">
                            {acc.email}
                          </p>
                        </div>
                        <Icon
                          icon="solar:alt-arrow-right-linear"
                          className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:text-forest transition-all"
                        />
                      </button>
                    ))}

                    <button
                      disabled={googleLoading}
                      onClick={() => setGoogleStep("custom")}
                      className="w-full flex items-center gap-3 p-3 border border-dashed border-gray-200 rounded-xl hover:bg-slate-50 hover:border-gray-300 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                        <Icon icon="solar:user-plus-linear" className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-600 group-hover:text-forest transition-colors">
                          Use another account
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          Sign in with a different Google account
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {googleStep === "custom" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGoogleSelect(googleUser.name, googleUser.email);
                  }}
                  className="space-y-4"
                >
                  <p className="text-xs text-gray-500 font-semibold mb-2">
                    Enter details of your simulated Google Account
                  </p>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Google User"
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:bg-white focus:border-forest"
                      value={googleUser.name}
                      onChange={(e) => setGoogleUser({ ...googleUser, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="user@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:bg-white focus:border-forest"
                      value={googleUser.email}
                      onChange={(e) => setGoogleUser({ ...googleUser, email: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setGoogleStep("choose")}
                      className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest/90 transition-colors cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}

              {googleStep === "phone" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGoogleRegister();
                  }}
                  className="space-y-4"
                >
                  <div className="bg-green-50 border border-green-100 p-3.5 rounded-xl flex gap-2.5 items-start">
                    <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-forest">Almost there!</p>
                      <p className="text-[10px] text-gray-500 font-semibold leading-normal">
                        To complete your Raman Green registration, please provide your mobile phone number.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mobile Phone Number</label>
                    <div className="relative flex items-center">
                      <Icon icon="solar:phone-calling-linear" className="absolute left-3 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:bg-white focus:border-forest"
                        value={googleUser.phone}
                        onChange={(e) => setGoogleUser({ ...googleUser, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setGoogleStep("choose")}
                      className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={googleLoading}
                      className="flex-1 py-2 bg-[#47C269] text-white rounded-xl text-xs font-bold hover:bg-[#3eac5c] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {googleLoading ? (
                        <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />
                      ) : (
                        <span>Complete Sign-In</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Link below the card */}
      <div className="mt-8 text-center text-xs font-semibold text-gray-500">
        <span>Already have an account? </span>
        <Link
          href={`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="text-[#47C269] hover:text-[#3eac5c] hover:underline font-extrabold transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <LandingLayout>
      <div className="w-full bg-[#FAF9F6] min-h-[580px] flex flex-col md:flex-row border-t border-gray-100">
        {/* Left Column: Natural Brand Side (Desktop Only) */}
        <div className="relative hidden md:flex md:w-[40%] lg:w-[42%] overflow-hidden border-r border-gray-100 min-h-[550px]">
          <Image
            src="/login/loginLeft.png"
            alt="Raman Green Organic Products background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right Column: Register Form */}
        <div className="w-full md:w-[60%] lg:w-[58%] flex flex-col justify-center py-8 px-6 sm:px-12 md:px-16 lg:px-20 bg-white relative">
          {/* Background pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-45">
            <Image
              src="/login/right_bg.png"
              alt="Background pattern"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-full max-w-lg mx-auto relative z-10">
            <Suspense fallback={
              <div className="w-full py-12 flex items-center justify-center">
                <Icon icon="mdi:loading" className="animate-spin text-forest w-8 h-8" />
              </div>
            }>
              <RegisterForm />
            </Suspense>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
