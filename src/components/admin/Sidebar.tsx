"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';

interface SubItem {
  name: string;
  href: string;
}

interface NavItemDef {
  name: string;
  href: string;
  icon: string;
  subItems?: SubItem[];
}

interface NavGroup {
  label: string;
  items: NavItemDef[];
}

interface SidebarProps {
  adminUser: any;
  handleLogout: () => void;
}

const NavItem = ({ item }: { item: NavItemDef }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const checkActive = (href: string) => {
    const [path, query] = href.split('?');
    if (pathname !== path) return false;
    
    if (query) {
      const params = new URLSearchParams(query);
      for (const [key, value] of params.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
    } else if (searchParams.toString()) {
       if (path.includes('settings') && searchParams.toString()) return false;
    }
    
    return true;
  };

  const isActive = checkActive(item.href) || (item.subItems && item.subItems.some(sub => checkActive(sub.href)));
  const [isOpen, setIsOpen] = useState(!!isActive && !!item.subItems);

  if (item.subItems) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group ${
            isActive
              ? 'bg-green-50 text-green-700'
              : 'text-[#637381] hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon
              icon={item.icon}
              className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-green-600' : 'text-[#637381]'}`}
            />
            <span className={`text-[14px] font-medium ${isActive ? 'text-green-700' : ''}`}>
              {item.name}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon
              icon="lucide:chevron-right"
              className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`}
            />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-1 ml-6 relative overflow-hidden"
            >
              {/* Vertical connector line */}
              <div
                className="absolute left-0 top-0 w-px bg-gray-200"
                style={{ height: `calc(100% - 16px)` }}
              />
              <div className="space-y-0.5 pb-1">
                {item.subItems.map((sub) => {
                  const isSubActive = checkActive(sub.href);
                  return (
                    <motion.div 
                      key={sub.name} 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="relative"
                    >
                      {/* Horizontal connector branch */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-200" />
                      <Link
                        href={sub.href}
                        className={`ml-5 flex items-center px-2.5 py-1.5 rounded-lg text-[12px] transition-all duration-150 ${
                          isSubActive
                            ? 'bg-gray-100 text-gray-900 font-bold'
                            : 'text-[#919eab] hover:text-gray-700 hover:bg-gray-50 font-medium'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-green-50 text-green-700'
          : 'text-[#637381] hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon
        icon={item.icon}
        className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-green-600' : 'text-[#637381]'}`}
      />
      <span className={`text-[14px] font-medium ${isActive ? 'text-green-700' : ''}`}>
        {item.name}
      </span>
    </Link>
  );
};

const SidebarGroup = ({ group }: { group: NavGroup }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div key={group.label}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-3 mb-3 group/header cursor-pointer"
      >
        <p className="text-[11px] font-bold  group-hover/header:text-gray-900 text-gray-400 uppercase tracking-[0.1em]">
          {group.label}
        </p>
        <Icon 
          icon="lucide:chevron-down" 
          className={`w-3.5 h-3.5 text-gray-400 transition-all duration-200 opacity-0 group-hover/header:opacity-100 ${isCollapsed ? '-rotate-90' : ''}`}
        />
      </button>
      
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1.5"
          >
            {group.items.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ adminUser, handleLogout }) => {
  const pathname = usePathname();
  const navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: 'solar:widget-5-bold-duotone' },
        { name: 'Orders', href: '/admin/orders', icon: 'solar:cart-large-2-bold-duotone' },
      ]
    },
    {
      label: 'Management',
      items: [
        {
          name: 'Products',
          href: '/admin/products',
          icon: 'solar:box-bold-duotone',
          subItems: [
            { name: 'List', href: '/admin/products' },
            { name: 'Add New', href: '/admin/products/add' },
          ]
        },
        {
          name: 'Categories',
          href: '/admin/categories',
          icon: 'solar:layers-bold-duotone',
          subItems: [
            { name: 'List', href: '/admin/categories' },
          ]
        },
        {
          name: 'Inventory',
          href: '/admin/inventory',
          icon: 'solar:clipboard-list-bold-duotone'
        },
        {
          name: 'Settings',
          href: '/admin/settings',
          icon: 'solar:settings-bold-duotone',
          subItems: [
            { name: 'Global Settings', href: '/admin/settings?tab=general' },
            { name: 'Certificates', href: '/admin/settings?tab=product&sub=certificates' },
            { name: 'Packaging', href: '/admin/settings?tab=product&sub=packaging' },
            { name: 'Units', href: '/admin/settings?tab=product&sub=units' },
            { name: 'Branding', href: '/admin/settings?tab=branding' },
          ]
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white flex flex-col fixed h-screen z-20 border-r border-gray-100 font-public">
      {/* Logo */}
      <div className="px-6 py-2 flex items-center justify-center">
        <Image 
          src="/logo.png" 
          alt="Raman Green" 
          width={180} 
          height={90} 
          className="h-20 w-auto object-contain"
          priority
        />
      </div>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} group={group} />
        ))}
      </nav>

      <div className="h-px bg-gray-100 mx-4" />

      {/* User + Logout */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs font-black shrink-0">
            {(adminUser?.name || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">{adminUser?.name || 'Admin'}</p>
            <p className="text-[10px] text-green-600 font-semibold">Verified Session</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[#637381] hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-sm group"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
            <Icon icon="lucide:log-out" className="w-4 h-4" />
          </div>
          Logout
        </button>
      </div>
    </aside>
  );
};
