"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { productsData, Product, Review } from "@/constants/products";
import ProductCard from "@/components/landing/ProductCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Custom tabs dataset mapped for specific premium products to yield flawless visual consistency
const tabContentMap: Record<string, {
  nutrition: {
    macroTitle: string;
    macros: { label: string; value: string }[];
    description: string;
    focusTitle: string;
    focusDesc: string;
  };
  provenance: {
    originTitle: string;
    rows: { label: string; value: string }[];
    description: string;
    pledgeTitle: string;
    pledgeDesc: string;
  };
  tips: {
    tipsTitle: string;
    rows: { label: string; value: string }[];
    description: string;
    prepTitle: string;
    prepDesc: string;
  };
}> = {
  // Premium Organic Chia (ID 7 / 1)
  "7": {
    nutrition: {
      macroTitle: "Macronutrients",
      macros: [
        { label: "Protein", value: "17g / 100g" },
        { label: "Dietary Fiber", value: "34g / 100g" },
        { label: "Healthy Fats", value: "31g / 100g" }
      ],
      description: "Our black chia seeds are exceptionally high in ALA (alpha-linolenic acid), a plant-based omega-3 fatty acid. They are also a complete protein source, containing all nine essential amino acids.",
      focusTitle: "VITALITY FOCUS",
      focusDesc: "High antioxidant activity helps combat oxidative stress and supports cellular health."
    },
    provenance: {
      originTitle: "Our Provenance",
      rows: [
        { label: "Source", value: "Rajasthan Orchards" },
        { label: "Soil Type", value: "Mineral-rich Clay loam" },
        { label: "Harvesting", value: "Hand-picked, sustainable" }
      ],
      description: "Cultivated in the pristine organic soils of Rajasthan, nurtured under absolute natural conditions with zero chemical fertilizers. Hand-harvested straight to preserve active nutrients.",
      pledgeTitle: "SUSTAINABLE PLEDGE",
      pledgeDesc: "100% direct-trade sourcing supports local family farms and promotes biodiversity."
    },
    tips: {
      tipsTitle: "Usage Tips",
      rows: [
        { label: "Best for", value: "Morning smoothie/oats" },
        { label: "Soaking", value: "10-15 mins in water" },
        { label: "Daily Dose", value: "1-2 tbsp (15g)" }
      ],
      description: "Perfect addition to overnight oats, morning smoothie bowls, or used as a plant-based egg replacement in baking. Easily integrates into any wellness daily ritual.",
      prepTitle: "PREP INSIGHT",
      prepDesc: "Soak in liquid at a 1:10 ratio to form a perfect nutritional gel that aids digestion."
    }
  }
};

// Generates fallback tab content dynamically for other products
const getProductTabContent = (prod: Product) => {
  const custom = tabContentMap[prod.id];
  if (custom) return custom;

  return {
    nutrition: {
      macroTitle: "Nutritional Profile",
      macros: [
        { label: "Energy", value: "360 kcal" },
        { label: "Organic Purity", value: "100%" },
        { label: "Active Nutrients", value: "Preserved" }
      ],
      description: `Premium, stone-ground or sustainably harvested ${prod.name} that retains naturally occurring vitamins, active mineral salts, and wholesome dietary fibers.`,
      focusTitle: "HOLISTIC HEALTH",
      focusDesc: "Meticulously unprocessed foods sustain steady glycemic release and metabolic vitality."
    },
    provenance: {
      originTitle: "Our Provenance",
      rows: [
        { label: "Origin", value: prod.details.origin || "Rajasthan Orchards" },
        { label: "Purity State", value: "Certified Pesticide-Free" },
        { label: "Cultivation", value: "Direct Trade Organic" }
      ],
      description: `Nurtured with ancient agrarian wisdom in Rajasthan's organic agricultural belts. Packed immediately upon harvest under clean, clinical conditions to secure maximum natural vitality.`,
      pledgeTitle: "FARM TO BOWL",
      pledgeDesc: "Every purchase directly supports our community cooperative of sustainable local heritage farmers."
    },
    tips: {
      tipsTitle: "Usage Tips",
      rows: [
        { label: "Usage", value: prod.details.prepTime || "Ready to eat" },
        { label: "Portion", value: "Serve as desired" },
        { label: "Storage", value: "Cool, dry airtight container" }
      ],
      description: `Our raw ${prod.name} requires minimal culinary effort. Excellent for quick wellness rituals, gourmet recipes, or enriching standard daily meals.`,
      prepTitle: "GOURMET ADVICE",
      prepDesc: "Incorporate organic honey or warm botanical milk to draw out deeper natural flavors."
    }
  };
};

export default function ProductDetailPage({ params }: PageProps) {
  // Unwrap Next.js 15 params promise
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  // Find target product
  const initialProduct = productsData.find((p) => p.id === productId) || productsData[6]; // Default to Premium Chia if not found

  // State
  const [product, setProduct] = useState<Product>(initialProduct);
  const [activeImage, setActiveImage] = useState<string>(initialProduct.image);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWeight, setSelectedWeight] = useState<string>("250g");
  const [activeTab, setActiveTab] = useState<"nutrition" | "provenance" | "tips">("nutrition");
  const [reviews, setReviews] = useState<Review[]>(initialProduct.reviews);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState<boolean>(false);
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

  // Dynamic pricing based on weight selection
  const getPriceForWeight = () => {
    if (selectedWeight === "500g") return product.price;
    if (selectedWeight === "1kg") return Math.round(product.price * 1.8);
    return Math.round(product.price * 0.55); // 250g
  };

  const currentPrice = getPriceForWeight();
  const formattedPriceText = `₹${currentPrice.toLocaleString("en-IN")}`;
  const tabData = getProductTabContent(product);

  // Retrieve up to 4 relevant recommendations matching the current category
  const getRecommendations = () => {
    const categoryMatches = productsData.filter(
      (p) => p.category === product.category && p.id !== product.id
    );
    if (categoryMatches.length >= 4) {
      return categoryMatches.slice(0, 4);
    }
    const others = productsData.filter(
      (p) => p.id !== product.id && p.category !== product.category
    );
    return [...categoryMatches, ...others].slice(0, 4);
  };

  const recommendedProducts = getRecommendations();

  // Review Form States
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formAuthor, setFormAuthor] = useState<string>("");
  const [formHeadline, setFormHeadline] = useState<string>("");
  const [formText, setFormText] = useState<string>("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  // Sample preset images for mock review upload
  const uploadPresets = [
    "https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?w=300&q=80",
    "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=300&q=80",
    "https://images.unsplash.com/photo-1601379327928-bedfaf9da2d0?w=300&q=80",
  ];

  // Update image when product changes
  useEffect(() => {
    setActiveImage(product.image);
    setReviews(product.reviews);
  }, [product]);

  // Handle Add to Cart
  const handleAddToCart = () => {
    try {
      const existingCart = localStorage.getItem("rg-cart");
      let cart = [];
      if (existingCart) {
        cart = JSON.parse(existingCart);
      }

      // Add based on quantity and weight variation
      for (let i = 0; i < quantity; i++) {
        cart.push({
          id: `${product.id}-${selectedWeight}`,
          name: `${product.name} (${selectedWeight})`,
          price: currentPrice,
          image: product.image,
          category: product.categoryLabel,
        });
      }

      localStorage.setItem("rg-cart", JSON.stringify(cart));
      localStorage.setItem("rg-cart-count", cart.length.toString());

      // Dispatch storage event to trigger Navbar sync
      window.dispatchEvent(new Event("storage"));

      toast.success(`Added ${quantity} x ${product.name} (${selectedWeight}) to cart!`);
    } catch (e) {
      toast.error("Failed to add items to cart.");
    }
  };

  // Handle Helpful Vote
  const handleHelpfulVote = (reviewId: string) => {
    if (votedReviews[reviewId]) {
      toast.error("You have already voted on this review.");
      return;
    }

    setReviews((prev) =>
      prev.map((rev) =>
        rev.id === reviewId ? { ...rev, helpfulCount: rev.helpfulCount + 1 } : rev
      )
    );
    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
    toast.success("Thanks for your feedback!");
  };

  // Handle Review Submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formHeadline.trim() || !formText.trim()) {
      toast.error("Please fill in all required review fields.");
      return;
    }

    const initials = formAuthor
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

    const newReview: Review = {
      id: `r_user_${Date.now()}`,
      author: formAuthor,
      avatarInitials: initials,
      rating: formRating,
      date: "Just now",
      headline: formHeadline,
      text: formText,
      images: attachedImages.length > 0 ? attachedImages : undefined,
      helpfulCount: 0,
      isVerified: true,
    };

    setReviews((prev) => [newReview, ...prev]);
    setIsWriteReviewOpen(false);
    toast.success("Review submitted! Thank you for the voice.");

    // Reset Form
    setFormAuthor("");
    setFormHeadline("");
    setFormText("");
    setFormRating(5);
    setAttachedImages([]);
  };

  // Toggle Mock Photo Attachment
  const togglePresetPhoto = (url: string) => {
    if (attachedImages.includes(url)) {
      setAttachedImages((prev) => prev.filter((img) => img !== url));
    } else {
      setAttachedImages((prev) => [...prev, url]);
    }
  };

  // Average Rating Calculation
  const totalReviewsCount = 123 + reviews.length;
  const ratingAverage = (
    (reviews.reduce((acc, rev) => acc + rev.rating, 0) + 4.8 * 123) /
    totalReviewsCount
  ).toFixed(1);

  return (
    <LandingLayout>
      <div className="bg-[#fbf9f6] text-[#1b1c1a] min-h-screen py-10 md:py-16 font-inter">
        <div className="max-w-[1280px] mx-auto px-5">

          {/* Minimal Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal/40 mb-8 uppercase tracking-wider">
            <Link href="/" className="hover:text-forest transition-colors">Home</Link>
            <Icon icon="solar:alt-arrow-right-linear" className="w-3 h-3" />
            <Link href="/shop" className="hover:text-forest transition-colors">Shop</Link>
            <Icon icon="solar:alt-arrow-right-linear" className="w-3 h-3" />
            <span className="text-forest font-bold">{product.name}</span>
          </div>

          {/* Product Showcase Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-20">

            {/* Gallery Column: Vertical thumbnails on left for desktop, horizontal on bottom for mobile */}
            <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">

              {/* Thumbnails list */}
              <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 shrink-0 select-none overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 no-scrollbar">
                <button
                  onClick={() => setActiveImage(product.image)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-[8px] overflow-hidden border-2 bg-white transition-all cursor-pointer shrink-0 ${activeImage === product.image ? "border-[#061907] scale-95 shadow-sm" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                >
                  <img src={product.image} alt="Main" className="w-full h-full object-cover pointer-events-none" />
                </button>

                {uploadPresets.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-[8px] overflow-hidden border-2 bg-white transition-all cursor-pointer shrink-0 ${activeImage === imgUrl ? "border-[#061907] scale-95 shadow-sm" : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${i}`} className="w-full h-full object-cover pointer-events-none" />
                  </button>
                ))}
              </div>

              {/* Main Image Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-grow aspect-square rounded-[16px] overflow-hidden bg-white border border-[#1b1c1a]/5 shadow-sm order-1 md:order-2 relative"
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.tags.includes("Organic") && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[#ccf078] text-[#061907] text-[10px] font-bold uppercase tracking-wider rounded-[4px] shadow-sm z-10">
                    100% Certified Organic
                  </span>
                )}
              </motion.div>

            </div>

            {/* Info / Metadata Column */}
            <div className="lg:col-span-5 flex flex-col">

              {/* Category tag / Premium badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4d6700] bg-sage/35 px-2.5 py-0.5 rounded-[4px]">
                  PREMIUM HEIRLOOM
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#4d6700] gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} icon="solar:star-bold" className="w-3.5 h-3.5 text-[#4d6700]" />
                    ))}
                  </div>
                  <span className="text-[11px] font-inter font-semibold text-charcoal/50">
                    ({totalReviewsCount} reviews)
                  </span>
                </div>
              </div>

              {/* Title (Source Serif 4) */}
              <h1 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight text-[#061907] leading-tight mb-3">
                {product.name}
              </h1>

              {/* Price section */}
              <div className="mb-6 font-inter text-xl md:text-2xl font-bold text-[#061907]">
                {formattedPriceText}
              </div>

              {/* Short description */}
              <p className="text-xs md:text-sm text-charcoal/70 leading-relaxed font-semibold mb-6">
                {product.description}
              </p>

              {/* SELECT WEIGHT Section */}
              <div className="mb-6">
                <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider block mb-2.5">
                  SELECT WEIGHT
                </span>
                <div className="flex gap-2.5">
                  {["250g", "500g", "1kg"].map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-5 py-2.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${selectedWeight === w
                        ? "bg-[#061907] border-[#061907] text-white font-bold"
                        : "bg-transparent border-[#dbdad7] text-charcoal hover:border-charcoal/30"
                        }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Cart CTAs sitting on the same line */}
              <div className="flex items-center gap-4 mb-8">
                {/* Quantity Control */}
                <div className="flex items-center justify-between border border-[#1b1c1a]/10 bg-[#FAF9F6] rounded-full p-2 min-w-[130px] h-12 shrink-0">
                  <button
                    onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#1b1c1a]/5 transition-colors cursor-pointer text-charcoal/60"
                  >
                    <Icon icon="ic:outline-minus" className="w-3.5 h-3.5 font-bold" />
                  </button>
                  <span className="font-semibold text-xs text-charcoal/80 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#1b1c1a]/5 transition-colors cursor-pointer text-charcoal/60"
                  >
                    <Icon icon="ic:outline-plus" className="w-3.5 h-3.5 font-bold" />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow h-12 inline-flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-white text-[11px] font-bold uppercase tracking-wider rounded-[8px] active:scale-98 transition-all shadow-sm cursor-pointer"
                >
                  ADD TO CART
                  <Icon icon="lucide:shopping-bag" className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-8 border-t border-[#1b1c1a]/5 pt-8 mt-2 text-xs font-semibold text-charcoal/80 uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:leaf" className="w-5.5 h-5.5 text-[#4d6700] shrink-0" />
                  <span>100% Organic</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:shield-check" className="w-5.5 h-5.5 text-[#4d6700] shrink-0" />
                  <span>Verified Non-GMO</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:globe" className="w-5.5 h-5.5 text-[#4d6700] shrink-0" />
                  <span>Sustainably Sourced</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:check-circle" className="w-5.5 h-5.5 text-[#4d6700] shrink-0" />
                  <span>Zero Additives</span>
                </div>
              </div>

            </div>

          </div>

          {/* Tab Menu Selector (Nutritional Profile, Our Provenance, Usage Tips) */}
          <div className="mb-20">
            {/* Tab Headers */}
            <div className="flex gap-8 border-b border-[#1b1c1a]/10 pb-px mb-8 overflow-x-auto select-none no-scrollbar">
              {[
                { id: "nutrition", label: "NUTRITIONAL PROFILE" },
                { id: "provenance", label: "OUR PROVENANCE" },
                { id: "tips", label: "USAGE TIPS" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-[11px] font-inter font-bold uppercase tracking-wider pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id
                    ? "border-[#4d6700] text-[#061907]"
                    : "border-transparent text-charcoal/40 hover:text-charcoal/70"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panel Content Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >

                {/* Left Card: Macro/Row Values */}
                <div className="lg:col-span-4 bg-white rounded-[16px] border border-[#1b1c1a]/5 p-6 shadow-none flex flex-col gap-4">
                  <h4 className="font-playfair text-base font-bold text-[#061907]">
                    {activeTab === "nutrition"
                      ? tabData.nutrition.macroTitle
                      : activeTab === "provenance"
                        ? tabData.provenance.originTitle
                        : tabData.tips.tipsTitle}
                  </h4>
                  <div className="flex flex-col">
                    {(activeTab === "nutrition"
                      ? tabData.nutrition.macros
                      : activeTab === "provenance"
                        ? tabData.provenance.rows
                        : tabData.tips.rows
                    ).map((row, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-3 border-b border-[#1b1c1a]/5 text-xs font-semibold last:border-b-0"
                      >
                        <span className="text-charcoal/45 font-medium">{row.label}</span>
                        <span className="text-[#061907] text-right font-bold">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Paragraph Description + Callout box */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                  {/* Long Description Text */}
                  <p className="text-xs md:text-sm text-charcoal/70 leading-relaxed font-semibold">
                    {activeTab === "nutrition"
                      ? tabData.nutrition.description
                      : activeTab === "provenance"
                        ? tabData.provenance.description
                        : tabData.tips.description}
                  </p>

                  {/* High-fidelity Callout box matching screenshot */}
                  <div className="border-l-4 border-[#4d6700] bg-[#4d6700]/5 rounded-[6px] p-5 flex flex-col gap-1.5 shadow-sm">
                    <span className="text-[10px] font-bold text-[#4d6700] uppercase tracking-wider">
                      {activeTab === "nutrition"
                        ? tabData.nutrition.focusTitle
                        : activeTab === "provenance"
                          ? tabData.provenance.pledgeTitle
                          : tabData.tips.prepTitle}
                    </span>
                    <p className="text-[11px] text-charcoal/80 leading-relaxed font-semibold">
                      {activeTab === "nutrition"
                        ? tabData.nutrition.focusDesc
                        : activeTab === "provenance"
                          ? tabData.provenance.pledgeDesc
                          : tabData.tips.prepDesc}
                    </p>
                  </div>

                </div>

              </motion.div>
            </AnimatePresence>
          </div>


          {/* Recommended Products: You May Also Seek (EXACTLY MATCHING user screenshot) */}
          <div className="mb-20 border-t border-[#1b1c1a]/5 pt-16">
            {/* Header section */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[10px] font-bold text-[#4d6700] uppercase tracking-widest block mb-1">
                  THE COMPLETE RITUAL
                </span>
                <h3 className="font-playfair text-2xl md:text-3xl font-bold text-[#061907]">
                  You May Also Seek
                </h3>
              </div>
              <Link
                href={`/shop?category=${product.category}`}
                className="text-xs font-semibold text-charcoal/60 hover:text-forest underline transition-colors"
              >
                View All {product.categoryLabel}
              </Link>
            </div>

            {/* Recommendation Cards Grid using core ProductCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {recommendedProducts.map((recProd, idx) => (
                <div
                  key={recProd.id}
                  className="h-full"
                  onClick={() => {
                    // Scroll to top smoothly upon navigating to next dynamic product detail
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ProductCard
                    product={{
                      id: recProd.id,
                      name: recProd.name,
                      description: recProd.description,
                      price: recProd.formattedPrice,
                      originalPrice: recProd.originalPrice,
                      image: recProd.image,
                      tags: recProd.tags,
                    }}
                    index={idx}
                  />
                </div>
              ))}
            </div>
          </div>


          {/* Honest Feedback Section (EXACTLY MATCHING screen.png) */}
          <div className="border-t border-[#1b1c1a]/5 pt-16 mb-20">

            {/* Small Gold Header */}
            <span className="text-[10px] font-bold text-[#4d6700] uppercase tracking-widest block mb-1">
              THE COMMUNITY VOICE
            </span>

            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-[#061907] tracking-tight">
                  Honest Feedback
                </h2>

                {/* Sub-Ratings summary */}
                <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                  <span className="text-xl font-extrabold text-[#061907]">{ratingAverage} <span className="text-xs text-charcoal/45 font-medium">/ 5</span></span>
                  <div className="flex text-[#4d6700] gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} icon="solar:star-bold" className="w-4 h-4" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-charcoal/50">({totalReviewsCount} Verified Reviews)</span>
                </div>
              </div>

              {/* Pill-shaped WRITE A REVIEW button */}
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#061907] hover:bg-[#1a2e1a] text-white text-[11px] font-inter font-bold uppercase tracking-wider rounded-full active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                WRITE A REVIEW
              </button>
            </div>

            {/* Reviews stream container */}
            <div className="flex flex-col gap-8">
              <AnimatePresence initial={false}>
                {reviews.map((rev) => (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="border-b border-[#1b1c1a]/5 pb-8 flex flex-col items-start w-full relative"
                  >

                    {/* User profile row */}
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#1b1c1a]/5 flex items-center justify-center text-[11px] font-bold text-forest shadow-inner">
                          {rev.avatarInitials}
                        </div>
                        {/* Name and verified tag */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#061907]">{rev.author}</span>
                          {rev.isVerified && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-forest uppercase tracking-wider">
                              <Icon icon="solar:verified-check-bold" className="w-3.5 h-3.5 text-forest" />
                              VERIFIED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Date Stamp */}
                      <span className="text-[10px] font-medium text-charcoal/40 uppercase tracking-wider text-right">
                        {rev.date}
                      </span>
                    </div>

                    {/* Star Rating list */}
                    <div className="flex text-[#4d6700] mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon
                          key={i}
                          icon={i < Math.floor(rev.rating) ? "solar:star-bold" : "solar:star-linear"}
                          className="w-3.5 h-3.5"
                        />
                      ))}
                    </div>

                    {/* Review Title Headline */}
                    <h4 className="font-playfair text-sm md:text-base font-bold text-[#061907] mb-2 leading-snug">
                      {rev.headline}
                    </h4>

                    {/* Review Body description */}
                    <p className="text-xs md:text-sm text-charcoal/70 leading-relaxed font-medium mb-4 max-w-3xl">
                      {rev.text}
                    </p>

                    {/* Image uploads preview if present */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex gap-2.5 mb-4">
                        {rev.images.map((imgSrc, i) => (
                          <div
                            key={i}
                            className="w-16 h-16 rounded-[8px] overflow-hidden border border-[#1b1c1a]/10 bg-[#FAF9F6]"
                          >
                            <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Thumbs up Helpful interaction */}
                    <button
                      onClick={() => handleHelpfulVote(rev.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-all duration-200 ${votedReviews[rev.id]
                        ? "bg-forest/10 border-forest/20 text-forest"
                        : "bg-white border-[#1b1c1a]/10 text-charcoal/60 hover:bg-[#FAF9F6] hover:text-charcoal"
                        }`}
                    >
                      <Icon icon="solar:like-linear" className="w-3.5 h-3.5" />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>

      {/* Dynamic Review Submission Modal (Framer Motion popup Drawer) */}
      <AnimatePresence>
        {isWriteReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

            {/* Dark Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWriteReviewOpen(false)}
              className="absolute inset-0 bg-[#061907]/60 backdrop-blur-xs"
            />

            {/* Modal Content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white w-full max-w-[500px] rounded-[20px] shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto"
            >

              {/* Close Button */}
              <button
                onClick={() => setIsWriteReviewOpen(false)}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal cursor-pointer"
              >
                <Icon icon="solar:close-circle-linear" className="w-6 h-6" />
              </button>

              <span className="text-[9px] font-bold text-[#4d6700] uppercase tracking-wider block mb-1">
                SUBMIT RATING
              </span>
              <h3 className="font-playfair text-xl md:text-2xl font-bold text-[#061907] mb-6">
                Write a Review
              </h3>

              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5">

                {/* Dynamic Rating Stars Selector */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal/50 block mb-2">
                    Review Rating *
                  </label>
                  <div className="flex text-[#4d6700] gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starVal = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormRating(starVal)}
                          onMouseEnter={() => setFormHoverRating(starVal)}
                          onMouseLeave={() => setFormHoverRating(0)}
                          className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Icon
                            icon="solar:star-bold"
                            className={`w-6 h-6 ${(formHoverRating || formRating) >= starVal ? "text-[#4d6700]" : "text-charcoal/20"}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nickname input */}
                <div>
                  <label htmlFor="nickname" className="text-[11px] font-bold uppercase tracking-wider text-charcoal/50 block mb-2">
                    Your Nickname *
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Anya R."
                    className="w-full bg-[#FAF9F6] border border-[#1b1c1a]/15 rounded-[12px] px-4 py-3 text-xs font-semibold outline-none focus:border-forest/30 transition-all font-inter"
                  />
                </div>

                {/* Review Headline input */}
                <div>
                  <label htmlFor="headline" className="text-[11px] font-bold uppercase tracking-wider text-charcoal/50 block mb-2">
                    Review Headline *
                  </label>
                  <input
                    id="headline"
                    type="text"
                    required
                    value={formHeadline}
                    onChange={(e) => setFormHeadline(e.target.value)}
                    placeholder="e.g. Purity you can taste"
                    className="w-full bg-[#FAF9F6] border border-[#1b1c1a]/15 rounded-[12px] px-4 py-3 text-xs font-semibold outline-none focus:border-forest/30 transition-all font-inter"
                  />
                </div>

                {/* Review Textarea Description */}
                <div>
                  <label htmlFor="reviewText" className="text-[11px] font-bold uppercase tracking-wider text-charcoal/50 block mb-2">
                    Review Details *
                  </label>
                  <textarea
                    id="reviewText"
                    required
                    rows={4}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Tell us about the texture, quality, and flavor..."
                    className="w-full bg-[#FAF9F6] border border-[#1b1c1a]/15 rounded-[12px] px-4 py-3 text-xs font-semibold outline-none focus:border-forest/30 transition-all font-inter resize-none leading-relaxed"
                  />
                </div>

                {/* Interactive photo attachment selector */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal/50 block mb-2">
                    Attach Showcase Photos (Optional)
                  </label>
                  <p className="text-[10px] text-charcoal/40 mb-3">
                    Choose from our botanical assets to mock upload:
                  </p>
                  <div className="flex gap-3">
                    {uploadPresets.map((imgUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => togglePresetPhoto(imgUrl)}
                        className={`relative w-14 h-14 rounded-[8px] overflow-hidden border-2 bg-white transition-all cursor-pointer ${attachedImages.includes(imgUrl) ? "border-[#4d6700] scale-95" : "border-transparent opacity-60"
                          }`}
                      >
                        <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        {attachedImages.includes(imgUrl) && (
                          <div className="absolute inset-0 bg-[#061907]/40 flex items-center justify-center text-white">
                            <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-[#ccf078]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submission CTA button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-[#061907] hover:bg-[#1a2e1a] text-white text-[11px] font-bold uppercase tracking-wider rounded-[16px] shadow-md transition-all active:scale-98 cursor-pointer mt-2"
                >
                  Submit Voice
                </button>

              </form>
            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </LandingLayout>
  );
}
