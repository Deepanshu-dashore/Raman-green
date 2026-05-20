"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';

const AdminLogin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      
      if (json.success) {
        localStorage.setItem('adminToken', json.data.token);
        document.cookie = `authToken=${json.data.token}; path=/; max-age=604800`;
        toast.success("Welcome back!");
        router.push('/admin');
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.success("Google Sign-In is not configured for admin accounts.");
  };

  const handleForgotPassword = () => {
    toast.success("Please contact the system administrator to reset your password.");
  };

  return (
    <div className="min-h-screen bg-[#F0F7F2] flex items-center justify-center p-4 lg:p-8 font-sans antialiased">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row min-h-[710px] border border-white">
        
        {/* Left Side: Premium Image Overlay & Info Panels */}
        <div className="hidden lg:flex lg:w-[50%] relative flex-col p-8 text-white overflow-hidden">
          {/* Background image & gradient overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ 
              backgroundImage: `url('/login_background_natural.png')` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102e20]/90 via-[#102e20]/75 to-transparent" />
          
          {/* Top Logo */}
          <div className="relative z-10 mb-auto">
            <Image 
              src="/logo.png" 
              alt="Raman Green" 
              width={140} 
              height={70} 
              className="h-14 w-auto object-contain brightness-0 invert opacity-95"
              priority
            />
          </div>

          {/* Middle Copy */}
          <div className="my-6 relative z-10">
            <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#47C269] uppercase block mb-3">
              ERP System
            </span>
            <h1 className="text-3xl lg:text-[40px] font-bold tracking-tight leading-[1.15] mb-2 font-lato">
              E-Commerce Management
            </h1>
            <h2 className="text-3xl lg:text-[40px] font-extrabold tracking-tight leading-[1.15] text-[#47C269] mb-6 font-lato">
              ERP
            </h2>
            
            <div className="w-16 h-[3px] bg-[#47C269] rounded-full mb-6"></div>
            
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm font-medium opacity-90">
              A complete solution to manage your business operations, inventory, sales, customers, and much more – all in one powerful platform.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-4 gap-2.5 mt-8">
              {/* Card 1: Orders Management */}
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 flex items-center justify-center mb-1">
                  <Icon icon="lucide:shopping-cart" className="w-7 h-7 text-[#47C269]" />
                </div>
                <span className="text-[10px] font-bold text-white/90 leading-tight">Orders<br />Management</span>
              </div>
              
              {/* Card 2: Inventory Control */}
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 flex items-center justify-center mb-1">
                  <Icon icon="lucide:box" className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white/90 leading-tight">Inventory<br />Control</span>
              </div>
              
              {/* Card 3: Customer Management */}
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 flex items-center justify-center mb-1">
                  <Icon icon="lucide:users" className="w-7 h-7 text-[#47C269]" />
                </div>
                <span className="text-[10px] font-bold text-white/90 leading-tight">Customer<br />Management</span>
              </div>
              
              {/* Card 4: Analytics & Reports */}
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 flex items-center justify-center mb-1">
                  <Icon icon="lucide:bar-chart-3" className="w-7 h-7 text-[#47C269]" />
                </div>
                <span className="text-[10px] font-bold text-white/90 leading-tight">Analytics<br />& Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Responsive Login Form */}
        <div className="w-full lg:w-[50%] p-8 lg:p-10 xl:p-12 flex flex-col justify-between bg-white relative">
          
        
          {/* Form Content Wrapper */}
          <div className="my-auto max-w-[390px] mx-auto w-full relative z-10">
            {/* Secure access badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-green-700 font-bold text-[11px] mb-4">
              <Icon icon="lucide:shield-check" className="w-4 h-4" />
              <span>Secure Admin Access</span>
            </div>

            {/* Titles */}
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2 font-lato">
                Welcome Back!
              </h1>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Sign in to your ERP dashboard to continue
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 w-full">
              {/* Email/Identifier field */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Admin Email
                </label>
                <div className="relative flex items-center group">
                  <Icon 
                    icon="lucide:mail" 
                    className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-[#47C269] transition-colors" 
                  />
                  <input
                    type="text"
                    required
                    placeholder="Enter your admin email"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#47C269] focus:ring-4 focus:ring-[#47C269]/10 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                    value={formData.identifier}
                    onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative flex items-center group">
                  <Icon 
                    icon="lucide:lock" 
                    className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-[#47C269] transition-colors" 
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#47C269] focus:ring-4 focus:ring-[#47C269]/10 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon 
                      icon={showPassword ? "lucide:eye-off" : "lucide:eye"} 
                      className="w-5 h-5" 
                    />
                  </button>
                </div>
              </div>

              {/* Checkbox and Forgot Password Link */}
              <div className="flex items-center justify-between text-xs font-bold">
                <label className="flex items-center gap-2 text-slate-500 hover:text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#47C269] focus:ring-[#47C269] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[#47C269] hover:text-green-700 transition-colors font-extrabold"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-gradient-to-r from-[#3eac5c] to-[#47C269] text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:shadow-lg active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none transition-all flex items-center justify-between mt-7 group"
              >
                {loading ? (
                  <div className="mx-auto animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                ) : (
                  <>
                    <span className="flex-grow text-center pl-6 font-bold">Login to Dashboard</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1 shrink-0">
                      <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 text-white" />
                    </div>
                  </>
                )}
              </button>
            </form>



            {/* Info Alerts Banner */}
            <div className="mt-4 p-3 bg-green-50/50 border border-green-100/50 rounded-2xl flex items-start gap-2.5">
              <Icon icon="lucide:shield-check" className="w-4.5 h-4.5 text-[#47C269] shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                This is a secure admin area. All activities are monitored and logged.
              </p>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 w-full">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
              <p>© 2026 Raman Green Technologies</p>
              <p className="text-slate-300 font-medium">All rights reserved | Secure ERP Environment</p>
            </div>
            <div className="flex items-center">
              <Icon 
                icon="game-icons:three-leaves" 
                className="w-10 h-10 shrink-0 bg-gradient-to-br from-[#3eac5c] to-[#47C269] bg-clip-text text-transparent" 
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminLogin;

