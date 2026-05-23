"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Seeds", href: "/shop?category=seeds" },
  { label: "Shops", href: "/shop" },
  { label: "Dry Foods", href: "/shop?category=dry-foods" },
  { label: "Instant", href: "/shop?category=instant" },
  { label: "Our Story", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-forest text-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="font-playfair text-xl font-bold tracking-tight whitespace-nowrap">
          Raman Green
        </Link>

        {/* Center nav — desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="nav-underline text-sm font-inter font-semibold tracking-[0.05em] uppercase opacity-90 hover:opacity-100 transition-opacity"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          <button aria-label="Search" className="hover:opacity-70 transition-opacity">
            <Icon icon="lucide:search" className="w-5 h-5" />
          </button>
          <Link href="/account" aria-label="Account" className="hover:opacity-70 transition-opacity hidden sm:block">
            <Icon icon="lucide:user" className="w-5 h-5" />
          </Link>
          <Link href="/cart" aria-label="Cart" className="hover:opacity-70 transition-opacity relative">
            <Icon icon="lucide:shopping-bag" className="w-5 h-5" />
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden hover:opacity-70 transition-opacity"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <Icon icon={mobileOpen ? "lucide:x" : "lucide:menu"} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <ul className="flex flex-col py-4 px-5 gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm font-inter font-semibold tracking-[0.05em] uppercase opacity-90 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm font-inter font-semibold tracking-[0.05em] uppercase opacity-90 hover:opacity-100 transition-opacity"
                >
                  Account
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
