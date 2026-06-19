"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/authSlice";

// Ticker announcements
const announcements = [
  "🌿 100% Organic & Farm Fresh Products - Direct from our Rajasthan Farms",
  "🚚 Free Express Delivery on orders above ₹499 - COD Available",
  "✨ Festive Offer: Use code RGSEED10 to get 10% off seeds & dry foods"
];

// Shop categories for dropdown menus
const shopCategories = [
  {
    title: "Organic Seeds",
    links: [
      { label: "Field Crop Seeds", description: "Premium seeds for high-yield farming.", href: "/shop?category=field-seeds", icon: "lucide:wheat" },
      { label: "Vegetable Seeds", description: "Non-hybrid seeds for home gardening.", href: "/shop?category=vegetable-seeds", icon: "lucide:sprout" },
    ],
  },
  {
    title: "Nutritious Powders",
    links: [
      { label: "Vegetable Powders", description: "100% pure dehydrated vegetable blends.", href: "/shop?category=vegetable-powders", icon: "lucide:carrot" },
      { label: "Fruit Powders", description: "Organic fruit concentrates rich in nutrients.", href: "/shop?category=fruit-powders", icon: "lucide:apple" },
      { label: "Spice Powders", description: "Freshly ground farm-direct spices.", href: "/shop?category=spice-powders", icon: "lucide:flame" },
      { label: "Herbal Powders", description: "Traditional wellness and herbal blends.", href: "/shop?category=herbal-powders", icon: "lucide:flower-2" },
    ],
  },
  {
    title: "Instant Food Mixes",
    links: [
      { label: "Instant Mixes", description: "Quick, nutritious, and wholesome meals.", href: "/shop?category=instant-mixes", icon: "lucide:zap" },
    ],
  },
];

const navItems = [
  { label: "Home", id: "home", href: "/" },
  { label: "Shop", id: "shop", href: "/shop" },
  { label: "About Us", id: "about", href: "/about" },
  { label: "Quality & Certifications", id: "quality", href: "/#quality" },
  { label: "Contact", id: "contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isLinkActive = (href: string) => {
    const [path, query] = href.split('?');
    if (pathname !== path) return false;

    if (query) {
      const params = new URLSearchParams(query);
      for (const [key, value] of params.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
    }
    return true;
  };

  const [tickerIndex, setTickerIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const cartCount = useAppSelector((state) => state.cart.totalItems);
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartTotalPrice = useAppSelector((state) => state.cart.totalPrice);
  const [mounted, setMounted] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loadingAuth = useAppSelector((state) => state.auth.loading);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Successfully logged out.");
      router.refresh();
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Logout failed.");
    }
  };

  // Mobile accordion states
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Rotate ticker messages
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Cart count sync handles automatically via Redux provider on mount

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
          className="max-w-[1280px] mx-auto px-5 md:px-16 flex items-center justify-between py-4 relative"
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
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <li
                  key={item.id}
                  className="h-full flex items-center"
                  onMouseEnter={() => {
                    if (item.id === "shop") {
                      setActiveMenu("shop");
                    } else {
                      setActiveMenu(null);
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    className={`group text-sm font-semibold py-1 flex items-center gap-1 transition-colors ${
                      active ? 'text-[#47C269]' : 'text-charcoal hover:text-[#47C269]'
                    }`}
                  >
                    <span className={`nav-underline ${active ? 'active' : ''}`}>
                      {item.label}
                    </span>
                    {item.id === "shop" && (
                      <Icon
                        icon="solar:alt-arrow-down-linear"
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          active ? 'text-[#47C269]' : ''
                        } ${activeMenu === "shop" ? 'rotate-180 text-[#47C269]' : ''}`}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
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

            {/* Cart Preview - Hover Dropdown */}
            <div className="relative group/cart">
              <Link
                href="/cart"
                aria-label="View Cart"
                className="hover:text-[#47C269] transition-colors p-1.5 rounded-full hover:bg-gray-50 relative block"
              >
                <Icon icon="solar:bag-3-linear" className="w-5.5 h-5.5 text-charcoal hover:text-[#3eac5c]" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#47C269] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
              {/* Mini Cart Preview */}
              <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/cart:opacity-100 group-hover/cart:translate-y-0 group-hover/cart:pointer-events-auto transition-all duration-300 z-50">
                <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 text-charcoal flex flex-col">
                  {cartCount === 0 ? (
                    <div className="flex flex-col items-center text-center">
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
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                        <span className="font-bold text-sm">Cart ({cartCount})</span>
                        <Link href="/cart" className="text-[#3eac5c] text-xs font-semibold hover:underline">View All</Link>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-3 mb-3 pr-1">
                        {cartItems.map((item: any, idx: number) => {
                          const price = item.price || item.variant?.price || 0;
                          return (
                            <div key={idx} className="flex gap-3 items-center">
                              <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                {item.product?.image ? (
                                  <img src={item.product.image} alt={item.product?.name || "Product"} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Icon icon="lucide:package" className="w-5 h-5 text-gray-300" /></div>
                                )}
                              </div>
                              <div className="flex flex-col flex-1 min-w-0 text-left">
                                <span className="text-sm font-bold truncate">{item.product?.name || "Organic Product"}</span>
                                <span className="text-[10px] text-gray-500 font-medium">{item.variant?.weight || "Default"} &bull; Qty: {item.quantity}</span>
                              </div>
                              <div className="text-sm font-bold text-forest">
                                ₹{(price * item.quantity).toLocaleString("en-IN")}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-100">
                        <span className="font-bold text-sm text-gray-600">Subtotal</span>
                        <span className="font-bold text-lg text-forest">₹{cartTotalPrice.toLocaleString("en-IN")}</span>
                      </div>
                      <Link
                        href="/checkout"
                        className="w-full bg-forest text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-forest/90 transition-colors text-center block"
                      >
                        Checkout Securely
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!mounted || loadingAuth ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse hidden sm:block" />
            ) : user ? (
              /* Account Profile - Hover Dropdown */
              <div className="relative group/account hidden sm:block">
                <button
                  aria-label="Account Settings"
                  className="flex items-center gap-1.5 focus:outline-none cursor-pointer group-hover/account:opacity-90 py-1.5"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-100 shadow-xs transition-transform duration-300 group-hover/account:scale-105 bg-gray-50 flex items-center justify-center">
                    <Image
                      src={user.image || "/placeholder/boy.png"}
                      alt="User Avatar"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-400 ring-1.5 ring-white animate-pulse" />
                  </div>
                  <Icon icon="solar:alt-arrow-down-linear" className="w-3 h-3 text-gray-400 group-hover/account:rotate-180 transition-transform duration-300" />
                </button>
                {/* Dropdown Box */}
                <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/account:opacity-100 group-hover/account:translate-y-0 group-hover/account:pointer-events-auto transition-all duration-300 z-50">
                  <div className="w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(27,48,34,0.08)] border border-gray-100 p-2.5 text-charcoal">
                    {/* User Profile Info Card */}
                    <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-50 mb-2 bg-gradient-to-br from-[#FAF9E6]/30 to-emerald-50/20 rounded-xl">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-white flex items-center justify-center shadow-xs">
                        <Image
                          src={user.image || "/placeholder/boy.png"}
                          alt="User Avatar"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate leading-snug">{user.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold truncate leading-none mt-0.5">
                          {user.email || user.phone || 'Verified User'}
                        </p>
                      </div>
                    </div>
                    {/* Navigation Items */}
                    <div className="space-y-0.5">
                      {user.role === "admin" && (
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50/80 rounded-xl text-xs font-semibold text-charcoal transition-all duration-200 group/item">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center transition-colors group-hover/item:bg-amber-100">
                            <Icon icon="solar:shield-keyhole-linear" className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">Admin Panel</span>
                            <span className="text-[9px] text-gray-400 font-medium">Manage systems & store</span>
                          </div>
                        </Link>
                      )}
                      <Link href="/account" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50/80 rounded-xl text-xs font-semibold text-charcoal transition-all duration-200 group/item">
                        <div className="w-7 h-7 rounded-lg bg-green-50 text-forest flex items-center justify-center transition-colors group-hover/item:bg-[#FAF9E6]">
                          <Icon icon="solar:user-linear" className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">My Profile</span>
                          <span className="text-[9px] text-gray-400 font-medium">Edit details & address</span>
                        </div>
                      </Link>
                      <Link href={user.role === "admin" ? "/admin/orders" : "/account/orders"} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50/80 rounded-xl text-xs font-semibold text-charcoal transition-all duration-200 group/item">
                        <div className="w-7 h-7 rounded-lg bg-green-50 text-forest flex items-center justify-center transition-colors group-hover/item:bg-[#FAF9E6]">
                          <Icon icon="solar:cart-large-2-linear" className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">My Orders</span>
                          <span className="text-[9px] text-gray-400 font-medium">Track order history</span>
                        </div>
                      </Link>
                    </div>
                    <div className="h-px bg-gray-100 my-1.5" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-bold text-charcoal transition-all cursor-pointer text-left group/item"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-50/50 text-rose-500 flex items-center justify-center transition-colors group-hover/item:bg-rose-100">
                        <Icon icon="solar:logout-3-linear" className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-rose-600">Sign Out</span>
                        <span className="text-[9px] text-rose-400 font-medium">End active session</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-charcoal hover:text-[#47C269] transition-colors py-1.5 px-3"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#47C269] hover:bg-[#3eac5c] text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

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
            {activeMenu === "shop" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 top-full w-full bg-white/98 backdrop-blur-md border-t border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-b-3xl overflow-hidden z-40 text-charcoal p-8 grid grid-cols-4 gap-8"
                onMouseEnter={() => setActiveMenu("shop")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                {/* Loop shopCategories */}
                <div className="col-span-3 grid grid-cols-3 gap-6">
                  {shopCategories.map((cat) => (
                    <div key={cat.title} className="flex flex-col gap-3">
                      <h5 className="text-[11px] font-extrabold text-forest uppercase tracking-widest border-b border-gray-100 pb-2.5 mb-2 pl-2">
                        {cat.title}
                      </h5>
                      <ul className="space-y-2">
                        {cat.links.map((link) => {
                          const active = isLinkActive(link.href);
                          return (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                onClick={() => setActiveMenu(null)}
                                className={`flex items-start gap-3.5 p-3 rounded-xl transition-all duration-300 group/menulink ${
                                  active 
                                    ? 'bg-[#FAF9E6] border border-forest/10 shadow-xs' 
                                    : 'border border-transparent hover:bg-gray-50'
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                                  active ? 'bg-forest text-white' : 'bg-green-50 text-[#3eac5c] group-hover/menulink:bg-forest group-hover/menulink:text-white'
                                }`}>
                                  <Icon 
                                    icon={link.icon} 
                                    className="w-5 h-5 transition-transform group-hover/menulink:scale-110" 
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className={`text-[13px] font-bold transition-colors ${
                                    active ? 'text-forest' : 'text-charcoal group-hover/menulink:text-forest'
                                  }`}>
                                    {link.label}
                                  </span>
                                  {link.description && (
                                    <span className="text-[11px] text-charcoal/50 group-hover/menulink:text-charcoal/70 transition-colors mt-0.5 font-medium leading-tight">
                                      {link.description}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Promo Card Column */}
                <div className="flex justify-end col-span-1">
                  <div className="w-full max-w-[280px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group/promo flex flex-col bg-gray-50/50">
                    <div className="relative w-full h-36 overflow-hidden">
                      <img
                        src="/home/centerImg.png"
                        alt="Flagship Store"
                        className="w-full h-full object-cover group-hover/promo:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#47C269] text-white text-[9px] font-extrabold uppercase rounded-full tracking-wider shadow-sm">
                        Featured Blends
                      </span>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h6 className="font-playfair font-extrabold text-gray-900 text-[15px] leading-snug">
                          Our Flagship Store
                        </h6>
                        <p className="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed">
                          Discover pure wellness & organic farm blends crafted for vitality.
                        </p>
                      </div>
                      <Link
                        href="/about"
                        onClick={() => setActiveMenu(null)}
                        className="text-[11px] font-bold text-forest hover:text-green-700 transition-colors flex items-center gap-1.5 mt-4 group-hover/promo:translate-x-1 duration-300"
                      >
                        Explore Story
                        <Icon icon="solar:arrow-right-linear" className="w-3.5 h-3.5" />
                      </Link>
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
                  {navItems.map((item) => {
                    const active = isLinkActive(item.href);
                    return (
                      <li key={item.id} className="border-b border-gray-50/50">
                        {item.id === "shop" ? (
                          <div>
                            <button
                              onClick={() => setMobileExpanded(mobileExpanded === "shop" ? null : "shop")}
                              className={`w-full py-3 flex items-center justify-between text-sm font-semibold transition-colors text-left ${
                                active ? 'text-[#47C269]' : 'text-forest hover:text-green-700'
                              }`}
                            >
                              <span>{item.label}</span>
                              <Icon
                                icon="solar:alt-arrow-down-linear"
                                className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === "shop" ? 'rotate-180 text-[#47C269]' : 'text-gray-400'}`}
                              />
                            </button>

                            <AnimatePresence initial={false}>
                              {mobileExpanded === "shop" && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden pl-4 border-l-2 border-green-50 mb-2 space-y-3"
                                >
                                  {shopCategories.map((cat) => (
                                    <div key={cat.title}>
                                      <h6 className="text-[11px] font-bold text-gray-400 mb-1.5">{cat.title}</h6>
                                      <div className="pl-2 space-y-1.5">
                                        {cat.links.map((link) => {
                                          const subActive = isLinkActive(link.href);
                                          return (
                                            <Link
                                              key={link.label}
                                              href={link.href}
                                              onClick={() => {
                                                setMobileOpen(false);
                                                setMobileExpanded(null);
                                              }}
                                              className={`flex items-center gap-2 py-1.5 text-xs font-semibold transition-colors ${
                                                subActive ? 'text-[#47C269]' : 'text-charcoal/70 hover:text-green-700'
                                              }`}
                                            >
                                              <Icon icon={link.icon} className={`w-3.5 h-3.5 ${subActive ? 'text-[#47C269]' : 'text-green-500'}`} />
                                              {link.label}
                                            </Link>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block py-3 text-sm font-semibold transition-colors ${
                              active ? 'text-[#47C269]' : 'text-forest hover:text-green-700'
                            }`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}

                  {/* Additional Mobile Pages */}
                  <li>
                    <Link
                      href="/store"
                      onClick={() => setMobileOpen(false)}
                      className={`block py-3 text-sm font-semibold transition-colors border-b border-gray-50/50 ${
                        isLinkActive('/store') ? 'text-[#47C269]' : 'text-forest hover:text-green-700'
                      }`}
                    >
                      Our Store
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className={`block py-3 text-sm font-semibold transition-colors border-b border-gray-50/50 ${
                        isLinkActive('/account') ? 'text-[#47C269]' : 'text-forest hover:text-green-700'
                      }`}
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
                <div className="flex flex-col gap-2 mt-1">
                  <div className="grid grid-cols-2 gap-3">
                    {user ? (
                      <>
                        <Link
                          href="/account"
                          onClick={() => setMobileOpen(false)}
                          className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-charcoal text-center text-xs font-bold rounded-xl transition-colors block"
                        >
                          My Account
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setMobileOpen(false)}
                          className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-charcoal text-center text-xs font-bold rounded-xl transition-colors block"
                        >
                          Wishlist
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setMobileOpen(false)}
                          className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-charcoal text-center text-xs font-bold rounded-xl transition-colors block"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setMobileOpen(false)}
                          className="py-2.5 px-4 bg-forest hover:bg-forest/90 text-white text-center text-xs font-bold rounded-xl transition-colors block"
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                  {!user && (
                    <Link
                      href="/wishlist"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-charcoal text-center text-xs font-bold rounded-xl transition-colors block"
                    >
                      Wishlist
                    </Link>
                  )}
                  {user && (
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-center text-xs font-bold rounded-xl border border-red-200 transition-colors block cursor-pointer"
                    >
                      Sign Out
                    </button>
                  )}
                  <Link
                    href="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-2.5 bg-forest hover:bg-forest/90 text-white text-center text-xs font-bold rounded-xl transition-colors block"
                  >
                    Cart ({mounted ? cartCount : 0})
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

