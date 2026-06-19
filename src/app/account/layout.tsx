"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/authSlice";
import LandingLayout from "@/components/landing/LandingLayout";

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  activeIcon: string;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/account",
    icon: "solar:widget-2-linear",
    activeIcon: "solar:widget-2-bold-duotone",
  },
  {
    label: "My Profile",
    href: "/account/profile",
    icon: "solar:user-linear",
    activeIcon: "solar:user-bold-duotone",
  },
  {
    label: "My Orders",
    href: "/account/orders",
    icon: "solar:cart-large-2-linear",
    activeIcon: "solar:cart-large-2-bold-duotone",
  },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loadingAuth = useAppSelector((state) => state.auth.loading);
  const initialized = useAppSelector((state) => state.auth.initialized);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If store initialization finished and no user exists, redirect to login
    if (mounted && initialized && !loadingAuth && !user) {
      toast.error("Please sign in to access your account dashboard.");
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/account")}`);
    }
  }, [mounted, initialized, loadingAuth, user, router, pathname]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Signed out successfully.");
      router.refresh();
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Logout failed.");
    }
  };

  // Show a premium pulsing loading skeleton during store load/hydration
  if (!mounted || !initialized || (loadingAuth && !user)) {
    return (
      <LandingLayout>
        <div className="w-full bg-[#FAF9F6] min-h-[600px] py-12 px-5 md:px-16 flex items-center justify-center">
          <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <div className="col-span-1 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col gap-6 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-px bg-gray-100 w-full" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-50 rounded-xl" />
                <div className="h-10 bg-gray-50 rounded-xl" />
                <div className="h-10 bg-gray-50 rounded-xl" />
              </div>
            </div>
            {/* Content Skeleton */}
            <div className="col-span-3 bg-white rounded-3xl p-8 border border-gray-100 space-y-6 animate-pulse">
              <div className="h-6 bg-gray-100 rounded w-1/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="h-28 bg-gray-50 rounded-2xl" />
                <div className="h-28 bg-gray-50 rounded-2xl" />
                <div className="h-28 bg-gray-50 rounded-2xl" />
              </div>
              <div className="h-48 bg-gray-50 rounded-2xl" />
            </div>
          </div>
        </div>
      </LandingLayout>
    );
  }

  // If unauthorized, return empty layout while redirecting
  if (!user) {
    return null;
  }

  return (
    <LandingLayout>
      <div className="w-full bg-[#FAF9F6] min-h-[600px] py-8 md:py-12 px-4 md:px-16 flex justify-center">
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Responsive Sidebar */}
          <div className="col-span-1 flex flex-col gap-6 lg:h-fit">
            
            {/* Profile Brief Info Card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_15px_40px_rgba(27,48,34,0.03)] flex flex-row lg:flex-col lg:items-center gap-4 lg:text-center">
              <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center shadow-xs">
                <Image
                  src={user.image || "/placeholder/boy.png"}
                  alt="Customer Avatar"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 lg:flex-none min-w-0">
                <h4 className="text-sm lg:text-base font-bold text-gray-900 truncate leading-snug">{user.name}</h4>
                <p className="text-[11px] text-gray-400 font-semibold truncate leading-none mt-0.5">{user.email || user.phone}</p>
                <div className="mt-2.5 flex items-center lg:justify-center">
                  <span className="bg-[#FAF9E6] border border-forest/10 text-forest text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
                    Raman Green Member
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex flex-col bg-white rounded-3xl p-3 border border-gray-100 shadow-[0_15px_40px_rgba(27,48,34,0.03)]">
              <div className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all group ${
                        isActive
                          ? "bg-forest text-white shadow-md shadow-forest/10"
                          : "text-charcoal hover:bg-gray-50/80 hover:text-forest"
                      }`}
                    >
                      <Icon
                        icon={isActive ? item.activeIcon : item.icon}
                        className={`w-5 h-5 transition-transform duration-300 group-hover:scale-105 ${
                          isActive ? "text-white" : "text-gray-400 group-hover:text-forest"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="h-px bg-gray-100 my-2 mx-2" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all group cursor-pointer text-left"
                >
                  <Icon
                    icon="solar:logout-3-linear"
                    className="w-5 h-5 text-red-500 transition-transform duration-300 group-hover:scale-105"
                  />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>

            {/* Mobile Tabbed Navigation */}
            <nav className="lg:hidden flex bg-white rounded-2xl p-1.5 border border-gray-100 shadow-[0_15px_40px_rgba(27,48,34,0.03)] overflow-x-auto gap-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-bold tracking-wide whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-forest text-white shadow-xs"
                        : "text-charcoal hover:bg-gray-50/60"
                    }`}
                  >
                    <Icon
                      icon={isActive ? item.activeIcon : item.icon}
                      className="w-4 h-4"
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 whitespace-nowrap cursor-pointer transition-all"
              >
                <Icon icon="solar:logout-3-linear" className="w-4 h-4" />
                <span>Out</span>
              </button>
            </nav>
          </div>

          {/* Main Profile Sub-Page Panel */}
          <main className="col-span-1 lg:col-span-3 flex flex-col">
            <div className="bg-white rounded-3xl p-5 md:p-8 border border-gray-100 shadow-[0_15px_40px_rgba(27,48,34,0.03)] flex-1 min-h-[400px]">
              {children}
            </div>
          </main>

        </div>
      </div>
    </LandingLayout>
  );
}
