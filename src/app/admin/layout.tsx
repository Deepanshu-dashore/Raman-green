"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

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

    // Verify admin session
    fetch('/api/admin/verify')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setAdminUser(json.data);
          setIsVerifying(false);
        } else {
          router.push('/admin/login');
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [pathname, router, isLoginPage]);

  const handleLogout = () => {
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (isVerifying && !isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Render children directly for login page without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-screen z-20">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-green-600 tracking-tight">Raman Green</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { name: 'Dashboard', href: '/admin', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
            { name: 'Products', href: '/admin/products', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
            { name: 'Categories', href: '/admin/categories', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /> },
            { name: 'Orders', href: '/admin/orders', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> }
          ].map((item) => (
            <a 
              key={item.name}
              href={item.href} 
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                pathname === item.href ? 'bg-green-50 text-green-700 font-bold' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className={`w-5 h-5 ${pathname === item.href ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col ml-64 min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
            {pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{adminUser?.name || 'Admin'}</p>
              <p className="text-[10px] text-green-600 font-extrabold uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded">Verified Admin</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold shadow-lg">
              {(adminUser?.name || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
