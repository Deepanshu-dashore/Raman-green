"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Ticker announcements
const announcements = [
  "🌿 100% Organic & Farm Fresh Products - Direct from our Rajasthan Farms",
  "🚚 Free Express Delivery on orders above ₹499 - COD Available",
  "✨ Festive Offer: Use code RGSEED10 to get 10% off seeds & dry foods"
];

// Mega menu datasets
const megaMenuData: Record<string, {
  title: string;
  links: { label: string; href: string; icon: string }[];
  promo: {
    title: string;
    tagline: string;
    image: string;
    href: string;
  };
}> = {
  seeds: {
    title: "Organic Seeds",
    links: [
      { label: "Chia Seeds", href: "/shop?category=seeds", icon: "solar:leaf-linear" },
      { label: "Pumpkin Seeds", href: "/shop?category=seeds", icon: "solar:leaf-linear" },
      { label: "Flax Seeds", href: "/shop?category=seeds", icon: "solar:leaf-linear" },
      { label: "Sunflower Seeds", href: "/shop?category=seeds", icon: "solar:leaf-linear" },
      { label: "Sesame Seeds", href: "/shop?category=seeds", icon: "solar:leaf-linear" },
    ],
    promo: {
      title: "Premium Chia Seeds",
      tagline: "Rich in Omega-3 & Antioxidants",
      image: "https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?w=300&q=80",
      href: "/shop?category=seeds"
    }
  },
  "dry-foods": {
    title: "Dry Fruits & Nuts",
    links: [
      { label: "Walnut Kernels", href: "/shop?category=dry-foods", icon: "solar:star-linear" },
      { label: "Premium Cashews", href: "/shop?category=dry-foods", icon: "solar:star-linear" },
      { label: "Roasted Almonds", href: "/shop?category=dry-foods", icon: "solar:star-linear" },
      { label: "Black Raisins", href: "/shop?category=dry-foods", icon: "solar:star-linear" },
      { label: "Dried Figs", href: "/shop?category=dry-foods", icon: "solar:star-linear" },
    ],
    promo: {
      title: "Kashmiri Walnuts",
      tagline: "100% Organic & Vacuum Sealed",
      image: "https://images.unsplash.com/photo-1585559606132-277ba3031a6d?w=300&q=80",
      href: "/shop?category=dry-foods"
    }
  },
  instant: {
    title: "Instant Food Grains",
    links: [
      { label: "Rolled Oats", href: "/shop?category=instant", icon: "solar:bolt-linear" },
      { label: "Millet Muesli", href: "/shop?category=instant", icon: "solar:bolt-linear" },
      { label: "Ready-to-Cook Mix", href: "/shop?category=instant", icon: "solar:bolt-linear" },
      { label: "Instant Veggie Soup", href: "/shop?category=instant", icon: "solar:bolt-linear" },
    ],
    promo: {
      title: "Millet Muesli",
      tagline: "No Added Sugar, High Dietary Fiber",
      image: "https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=300&q=80",
      href: "/shop?category=instant"
    }
  },
  crops: {
    title: "Organic Crops",
    links: [
      { label: "Heritage Wheat Grains", href: "/shop?category=crops", icon: "solar:leaf-linear" },
      { label: "Traditional Rolled Oats", href: "/shop?category=crops", icon: "solar:leaf-linear" },
      { label: "High-Fiber Millet Grain", href: "/shop?category=crops", icon: "solar:leaf-linear" },
      { label: "Organic Barley Seeds", href: "/shop?category=crops", icon: "solar:leaf-linear" },
      { label: "Premium Sorghum Grain", href: "/shop?category=crops", icon: "solar:leaf-linear" },
    ],
    promo: {
      title: "Heritage Rolled Oats",
      tagline: "100% Organic Stone-Ground Rolled Oats",
      image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&q=80",
      href: "/shop?category=crops"
    }
  },
  shops: {
    title: "Store Collections",
    links: [
      { label: "Browse All Shops", href: "/shop", icon: "solar:shop-linear" },
      { label: "Best Selling Products", href: "/shop?filter=best-sellers", icon: "solar:fire-linear" },
      { label: "New Launch Products", href: "/shop?filter=new", icon: "solar:notification-lines-linear" },
      { label: "Exclusive Offers", href: "/shop?filter=offers", icon: "solar:sale-linear" },
    ],
    promo: {
      title: "Gift Boxes & Hampers",
      tagline: "Share Wellness With Festive Hampers",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80",
      href: "/shop?filter=gifts"
    }
  }
};

const navItems = [
  { label: "Seeds", id: "seeds", href: "/shop?category=seeds" },
  { label: "Crops", id: "crops", href: "/shop?category=crops" },
  { label: "Dry Foods", id: "dry-foods", href: "/shop?category=dry-foods" },
  { label: "Instant", id: "instant", href: "/shop?category=instant" },
  { label: "Our Story", id: "story", href: "/about" },
];

export default function Navbar() {
  const router = useRouter();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Mobile accordion states
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Rotate ticker messages
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Sync Cart items count
  useEffect(() => {
    const syncCartCount = () => {
      try {
        const localCart = localStorage.getItem("rg-cart");
        if (localCart) {
          const parsed = JSON.parse(localCart);
          setCartCount(Array.isArray(parsed) ? parsed.length : 0);
        } else {
          const count = localStorage.getItem("rg-cart-count");
          setCartCount(count ? parseInt(count) || 0 : 0);
        }
      } catch (e) {
        setCartCount(0);
      }
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    return () => window.removeEventListener("storage", syncCartCount);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  return (
    <div className="w-full flex flex-col font-inter">
      {/* Top Announcement Bar / Information Ticker - Forest Green Theme Background */}
      <div className="bg-forest text-cream py-2 px-5 md:px-16 text-[11px] font-semibold border-b border-white/5 flex items-center justify-between gap-4">
        {/* Left Side: Support Callouts */}
        <div className="hidden lg:flex items-center gap-5 opacity-90">
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:phone-calling-linear" className="w-3.5 h-3.5 text-[#47C269]" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:letter-linear" className="w-3.5 h-3.5 text-[#47C269]" />
            <span>support@ramangreen.com</span>
          </div>
        </div>

        {/* Center: Fading Ticker message */}
        <div className="flex-1 text-center overflow-hidden h-4 relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIndex}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute whitespace-nowrap text-center text-[10px] md:text-[11px] tracking-wide"
            >
              {announcements[tickerIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Right Side: Quick Links */}
        <div className="hidden lg:flex items-center gap-5 opacity-90">
          <Link href="/account" className="hover:text-[#47C269] transition-colors flex items-center gap-1">
            <Icon icon="solar:delivery-linear" className="w-3.5 h-3.5" />
            Track Order
          </Link>
        </div>
      </div>

      {/* Main Navigation - Sticky White Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 text-charcoal shadow-sm">
        <div
          className="max-w-[1280px] mx-auto px-5 md:px-16 flex items-center justify-between h-18 relative"
          onMouseLeave={() => setActiveMenu(null)}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Raman Green Logo"
              width={140}
              height={70}
              className="h-13 w-auto object-contain transition-all duration-300"
              priority
            />
          </Link>

          {/* Center Navigation Links - Desktop */}
          <ul className="hidden md:flex items-center gap-8 h-full">
            {navItems.map((item) => (
              <li
                key={item.id}
                className="h-full flex items-center"
                onMouseEnter={() => {
                  if (megaMenuData[item.id]) {
                    setActiveMenu(item.id);
                  } else {
                    setActiveMenu(null);
                  }
                }}
              >
                <Link
                  href={item.href}
                  className="nav-underline text-xs font-bold tracking-[0.1em] uppercase py-6 flex items-center gap-1 hover:text-[#47C269] transition-colors"
                >
                  {item.label}
                  {megaMenuData[item.id] && (
                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === item.id ? 'rotate-180 text-[#47C269]' : ''}`}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 lg:gap-5">
            {/* Search Toggle */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                setActiveMenu(null);
              }}
              aria-label="Search Store"
              className="hover:text-[#47C269] transition-colors p-1.5 rounded-full hover:bg-gray-50 cursor-pointer"
            >
              <Icon icon="solar:magnifer-linear" className="w-5.5 h-5.5 text-charcoal hover:text-[#3eac5c]" />
            </button>

            {/* Account Profile - Hover Dropdown */}
            <div className="relative group/account hidden sm:block">
              <Link
                href="/account"
                aria-label="Account Settings"
                className="hover:text-[#47C269] transition-colors p-1.5 rounded-full hover:bg-gray-50 block"
              >
                <Icon icon="solar:user-circle-linear" className="w-5.5 h-5.5 text-charcoal hover:text-[#3eac5c]" />
              </Link>
              {/* Dropdown Box */}
              <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/account:opacity-100 group-hover/account:translate-y-0 group-hover/account:pointer-events-auto transition-all duration-300 z-50">
                <div className="w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 text-charcoal">
                  <div className="px-4 py-2.5 border-b border-gray-50 mb-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Welcome</p>
                    <p className="text-sm font-bold text-forest truncate">Guest User</p>
                  </div>
                  <Link href="/account" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-xl text-sm font-semibold text-charcoal transition-colors">
                    <Icon icon="solar:user-linear" className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-xl text-sm font-semibold text-charcoal transition-colors">
                    <Icon icon="solar:cart-large-2-linear" className="w-4 h-4 text-gray-400" />
                    My Orders
                  </Link>
                  <div className="h-px bg-gray-100 my-1.5" />
                  <Link href="/admin/login" className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-bold text-charcoal transition-all">
                    <Icon icon="solar:log-out-linear" className="w-4 h-4 text-red-500" />
                    Sign In
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Link */}
            <Link
              href="/contact"
              aria-label="Contact Us"
              className="hover:text-[#47C269] transition-colors p-1.5 rounded-full hover:bg-gray-50 relative hidden sm:block"
            >
              <Icon icon="solar:letter-linear" className="w-5.5 h-5.5 text-charcoal hover:text-[#3eac5c]" />
            </Link>

            {/* Cart Preview - Hover Dropdown */}
            <div className="relative group/cart">
              <Link
                href="/cart"
                aria-label="View Cart"
                className="hover:text-[#47C269] transition-colors p-1.5 rounded-full hover:bg-gray-50 relative block"
              >
                <Icon icon="solar:bag-3-linear" className="w-5.5 h-5.5 text-charcoal hover:text-[#3eac5c]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#47C269] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
              {/* Mini Cart Preview */}
              <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/cart:opacity-100 group-hover/cart:translate-y-0 group-hover/cart:pointer-events-auto transition-all duration-300 z-50">
                <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 text-charcoal text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <Icon icon="solar:bag-3-bold-duotone" className="w-7 h-7 text-[#3eac5c]" />
                  </div>
                  <h5 className="font-bold text-base text-gray-900 mb-1">Your Cart is Empty</h5>
                  <p className="text-xs text-gray-400 max-w-[200px] mb-4">Add organic crops and seeds to get started on wellness.</p>
                  <Link
                    href="/shop"
                    className="w-full bg-forest text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-forest/90 transition-colors text-center block"
                  >
                    Browse Collections
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden hover:text-[#47C269] transition-colors p-1.5 rounded-full hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setMobileOpen(true);
                setSearchOpen(false);
              }}
              aria-label="Open Mobile Menu"
            >
              <Icon icon="solar:hamburger-menu-linear" className="w-6 h-6 text-charcoal hover:text-[#3eac5c]" />
            </button>
          </div>

          {/* Desktop Hover Mega-Menus */}
          <AnimatePresence>
            {activeMenu && megaMenuData[activeMenu] && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 top-full w-full bg-white border-t border-gray-100 shadow-2xl rounded-b-2xl overflow-hidden z-40 text-charcoal p-8 grid grid-cols-4 gap-8"
                onMouseEnter={() => setActiveMenu(activeMenu)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                {/* Links Column 1-2: Multi column links */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-4">
                    <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                      {megaMenuData[activeMenu].title}
                    </h5>
                    <ul className="space-y-3">
                      {megaMenuData[activeMenu].links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={() => setActiveMenu(null)}
                            className="flex items-center gap-2.5 text-[13px] font-semibold text-charcoal/80 hover:text-forest transition-colors"
                          >
                            <Icon icon={link.icon} className="w-4 h-4 text-[#3eac5c]" />
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                      Quick Links
                    </h5>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/shop" onClick={() => setActiveMenu(null)} className="text-[13px] font-semibold text-charcoal/80 hover:text-forest transition-colors flex items-center gap-2">
                          <Icon icon="solar:list-arrow-down-linear" className="w-4 h-4 text-[#3eac5c]" />
                          Explore Full Shop
                        </Link>
                      </li>
                      <li>
                        <Link href="/store" onClick={() => setActiveMenu(null)} className="text-[13px] font-semibold text-charcoal/80 hover:text-forest transition-colors flex items-center gap-2">
                          <Icon icon="solar:map-point-linear" className="w-4 h-4 text-[#3eac5c]" />
                          Visit Flagship Store
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" onClick={() => setActiveMenu(null)} className="text-[13px] font-semibold text-charcoal/80 hover:text-forest transition-colors flex items-center gap-2">
                          <Icon icon="solar:info-square-linear" className="w-4 h-4 text-[#3eac5c]" />
                          About Our Farm
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" onClick={() => setActiveMenu(null)} className="text-[13px] font-semibold text-charcoal/80 hover:text-forest transition-colors flex items-center gap-2">
                          <Icon icon="solar:letter-opened-linear" className="w-4 h-4 text-[#3eac5c]" />
                          Contact Support
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Promo Card Column 3-4 */}
                <div className="col-span-2 flex justify-end">
                  <div className="w-full max-w-[400px] rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group/promo flex bg-gray-50">
                    <div className="w-1/2 p-5 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[9px] font-black uppercase rounded tracking-wider">
                          Featured
                        </span>
                        <h6 className="font-playfair font-extrabold text-gray-900 mt-2 text-base leading-tight">
                          {megaMenuData[activeMenu].promo.title}
                        </h6>
                        <p className="text-[11px] text-gray-400 mt-1 font-medium leading-relaxed">
                          {megaMenuData[activeMenu].promo.tagline}
                        </p>
                      </div>
                      <Link
                        href={megaMenuData[activeMenu].promo.href}
                        onClick={() => setActiveMenu(null)}
                        className="text-xs font-bold text-forest hover:text-green-700 transition-colors flex items-center gap-1.5 mt-4"
                      >
                        Shop Product
                        <Icon icon="solar:arrow-right-linear" className="w-3.5 h-3.5 group-hover/promo:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                    <div className="w-1/2 relative h-full min-h-[160px]">
                      <img
                        src={megaMenuData[activeMenu].promo.image}
                        alt="Promo Product"
                        className="absolute inset-0 w-full h-full object-cover group-hover/promo:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Slide-Down Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-full left-0 w-full bg-white border-t border-gray-100 z-40 py-6 px-5 md:px-16 shadow-lg"
          >
            <div className="max-w-[700px] mx-auto relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search for organic seeds, dry fruits, oatmeal..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-12 pr-28 text-charcoal placeholder-gray-400 text-sm font-semibold outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Icon icon="solar:magnifer-linear" className="absolute left-4 w-5 h-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2.5 bg-[#47C269] hover:bg-[#3eac5c] text-white text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-full transition-all cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Popular Searches */}
              <div className="flex items-center gap-2.5 mt-3.5 text-xs text-charcoal/70 font-semibold pl-4">
                <span>Popular:</span>
                {["Chia Seeds", "Premium Walnuts", "Instant Oats", "Gift Boxes"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      router.push(`/shop?q=${encodeURIComponent(tag)}`);
                      setSearchOpen(false);
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition-colors border border-gray-200 text-charcoal/80"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute -right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 p-2 rounded-full hidden lg:block"
                aria-label="Close search"
              >
                <Icon icon="solar:close-circle-linear" className="w-7 h-7" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full max-w-[320px] bg-white text-charcoal z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <Image
                    src="/logo.png"
                    alt="Raman Green Logo"
                    width={110}
                    height={55}
                    className="h-9 w-auto object-contain"
                  />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-900 cursor-pointer"
                  >
                    <Icon icon="solar:close-square-linear" className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm font-semibold text-charcoal placeholder-gray-400 outline-none focus:border-green-500 focus:bg-white transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Icon icon="solar:magnifer-linear" className="absolute left-3.5 w-4 h-4 text-gray-400" />
                </form>

                {/* Links Accordion list */}
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <li key={item.id} className="border-b border-gray-50/50">
                      {megaMenuData[item.id] ? (
                        <div>
                          <button
                            onClick={() => setMobileExpanded(mobileExpanded === item.id ? null : item.id)}
                            className="w-full py-3 flex items-center justify-between text-sm font-bold text-forest hover:text-green-700 transition-colors uppercase tracking-wider text-left"
                          >
                            <span>{item.label}</span>
                            <Icon
                              icon="solar:alt-arrow-down-linear"
                              className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === item.id ? 'rotate-180 text-green-600' : 'text-gray-400'}`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {mobileExpanded === item.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-4 border-l-2 border-green-50 mb-2 space-y-1.5"
                              >
                                {megaMenuData[item.id].links.map((link) => (
                                  <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => {
                                      setMobileOpen(false);
                                      setMobileExpanded(null);
                                    }}
                                    className="flex items-center gap-2 py-2 text-xs font-semibold text-charcoal/70 hover:text-green-700 transition-colors"
                                  >
                                    <Icon icon={link.icon} className="w-3.5 h-3.5 text-green-500" />
                                    {link.label}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-3 text-sm font-bold text-forest hover:text-green-700 transition-colors uppercase tracking-wider"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}

                  {/* Additional Mobile Pages */}
                  <li>
                    <Link
                      href="/store"
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-sm font-bold text-forest hover:text-green-700 transition-colors uppercase tracking-wider border-b border-gray-50/50"
                    >
                      Our Store
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-sm font-bold text-forest hover:text-green-700 transition-colors uppercase tracking-wider border-b border-gray-50/50"
                    >
                      Track My Order
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Drawer Footer info */}
              <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Icon icon="solar:phone-calling-bold-duotone" className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-xs font-semibold">
                    <p className="text-gray-400 uppercase tracking-wider text-[9px] font-black">Call Support</p>
                    <p className="text-charcoal mt-0.5">+91 98765 43210</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-charcoal text-center text-xs font-bold rounded-xl transition-colors block"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 px-4 bg-forest hover:bg-forest/90 text-white text-center text-xs font-bold rounded-xl transition-colors block"
                  >
                    Cart ({cartCount})
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

