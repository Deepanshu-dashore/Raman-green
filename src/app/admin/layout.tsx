"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

import { Sidebar } from '@/components/admin/Sidebar';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsVerifying(false);
      return;
    }

    fetch('/api/admin/verify')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setAdminUser(json.data);
          setIsVerifying(false);
        } else {
          toast.error("Session expired. Please login again.");
          router.push('/admin/login');
        }
      })
      .catch(() => {
        toast.error("Authentication failed.");
        router.push('/admin/login');
      });
  }, [pathname, router, isLoginPage]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Server-side logout failed", error);
    }
    
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    localStorage.removeItem('adminToken');
    toast.success("Logged out successfully");
    router.push('/admin/login');
  };

  if (isVerifying && !isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-gray-900 font-public">
      {/* Sidebar */}
      <Sidebar 
        adminUser={adminUser} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Overview'}
          </h2>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-gray-100">
              {(adminUser?.name || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
