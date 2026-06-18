"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useAppSelector } from "@/store/hooks";
import { get } from "@/lib/axios";

export default function AccountDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const response = await get<any[]>("/api/orders");
        if (response.success && Array.isArray(response.data)) {
          setOrderCount(response.data.length);
        } else {
          setOrderCount(0);
        }
      } catch (err) {
        setOrderCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderStats();
  }, []);

  if (!user) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-xl md:text-2xl font-playfair font-extrabold text-gray-900 leading-snug">
          Account Dashboard
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Review your recent orders, manage your profile settings, and check account status.
        </p>
      </div>

      {/* Greeting Banner */}
      <div className="bg-gradient-to-br from-forest to-green-950 rounded-3xl p-6 md:p-8 text-cream shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5">
        <div className="space-y-2 relative z-10 max-w-md">
          <span className="bg-[#FAF9E6]/20 border border-[#FAF9E6]/10 text-cream text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Welcome Back
          </span>
          <h2 className="text-xl md:text-3xl font-playfair font-extrabold leading-tight">
            Hello, {user.name}!
          </h2>
          <p className="text-xs text-cream/70 font-semibold leading-relaxed">
            Thank you for choosing Raman Green. We are committed to delivering the purest organic crops, seeds, and farm-fresh wellness products directly to your doorstep.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#47C269] hover:bg-[#3eac5c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-forest/20"
          >
            <span>Browse Products</span>
            <Icon icon="solar:arrow-right-linear" className="w-4.5 h-4.5" />
          </Link>
        </div>
        
        {/* Background decorations */}
        <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-[#47C269]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Orders Card */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/30 rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-forest flex items-center justify-center shrink-0">
            <Icon icon="solar:box-minimalistic-linear" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Total Orders</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">
              {loading ? <span className="inline-block w-8 h-5 bg-gray-200 animate-pulse rounded" /> : orderCount}
            </h3>
          </div>
        </div>

        {/* Member Status Card */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/30 rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Icon icon="solar:verified-check-linear" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Account Status</p>
            <h3 className="text-sm font-extrabold text-amber-700 mt-1 uppercase tracking-wider">Active Member</h3>
          </div>
        </div>

        {/* Registration Date Card */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/30 rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Icon icon="solar:calendar-date-linear" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Joined On</p>
            <h3 className="text-xs font-bold text-gray-900 mt-1">
              {formatDate((user as any).createdAt)}
            </h3>
          </div>
        </div>

      </div>

      {/* Account Info and Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Profile Overview */}
        <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h5 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Icon icon="solar:user-linear" className="w-4.5 h-4.5 text-forest" />
              Profile Details
            </h5>
            <Link
              href="/account/profile"
              className="text-[10px] font-extrabold text-[#47C269] hover:underline uppercase tracking-wider"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-3 text-xs font-semibold text-charcoal/80">
            <div className="flex justify-between py-0.5">
              <span className="text-gray-400">Full Name</span>
              <span className="text-gray-900 font-bold">{user.name}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-gray-400">Email Address</span>
              <span className="text-gray-900 font-bold truncate max-w-[200px]">{user.email || "Not Provided"}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-gray-400">Phone Number</span>
              <span className="text-gray-900 font-bold">{user.phone}</span>
            </div>
          </div>
        </div>

        {/* Security / Info Support Panel */}
        <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h5 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Icon icon="solar:shield-check-linear" className="w-4.5 h-4.5 text-[#47C269]" />
              Security & support
            </h5>
          </div>
          <div className="space-y-3.5">
            <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
              Your account details are protected using industry-standard secure token restrictions. If you need any assistance or have questions regarding your orders, reach out to our team:
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                <Icon icon="solar:phone-calling-linear" className="w-4 h-4 text-forest" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                <Icon icon="solar:letter-linear" className="w-4 h-4 text-forest" />
                <span>support@ramangreen.com</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
