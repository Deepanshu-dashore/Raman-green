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

  return (
    <div className="h-screen bg-[#F0F7F2] flex items-center justify-center p-4 lg:p-10 font-sans overflow-hidden">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col lg:flex-row min-h-[540px] border border-white">
        
        {/* Left Side: Image with Glassmorphism */}
        <div className="hidden lg:block w-[55%] relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('/login_background_natural.png')` 
            }}
          >
            {/* Soft Ambient Overlay */}
            <div className="absolute inset-0 bg-black/5"></div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-[45%] p-8 lg:p-16 flex flex-col justify-between">
          <div className="w-full">
            <div className="mb-12 flex justify-start">
              <Image 
                src="/logo.png" 
                alt="Raman Green" 
                width={160} 
                height={80} 
                className="h-16 w-auto object-contain"
                priority
              />
            </div>

            <div className="mb-10">
              <h1 className="text-[38px] font-bold text-gray-900 leading-none mb-5 tracking-tight text-left font-lato">Welcome back!</h1>
              <p className="text-gray-400 text-base leading-relaxed font-medium text-left font-lato">
                Enter your credentials to access the management dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div className="group relative">
                <input
                  type="text"
                  required
                  placeholder="Admin Email"
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[18px] focus:ring-0 focus:border-[#47C269] focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400 font-semibold text-[14px]"
                  value={formData.identifier}
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                />
              </div>

              <div className="group relative">
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[18px] focus:ring-0 focus:border-[#47C269] focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400 font-semibold text-[14px]"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="flex justify-start px-1">
                <button type="button" className="text-[#47C269] text-[12px] font-bold hover:text-green-700 transition-colors uppercase tracking-wider">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-gray-950 text-white py-4 px-6 rounded-2xl font-bold text-base hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 mt-6 group"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <Icon icon="lucide:arrow-right" className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-50 w-full">
            <p className="text-gray-300 text-[9px] font-bold uppercase tracking-widest leading-loose text-left">
              © 2026 Raman Green Technologies<br />
              Secure Admin Environment
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
