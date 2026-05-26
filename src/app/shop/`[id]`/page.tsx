"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { productsData, Product, Review } from "@/constants/products";

interface PageProps {
  params: Promise<{ id: string }>;
}

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
  const [reviews, setReviews] = useState<Review[]>(initialProduct.reviews);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState<boolean>(false);
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

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

      // Add based on quantity
      for (let i = 0; i < quantity; i++) {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.categoryLabel,
        });
      }

      localStorage.setItem("rg-cart", JSON.stringify(cart));
      localStorage.setItem("rg-cart-count", cart.length.toString());

      // Dispatch storage event to trigger Navbar sync
      window.dispatchEvent(new Event("storage"));

      toast.success(`Added ${quantity} ${product.name} to cart!`);
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
        <div className="max-w-[1280px] mx-auto">

          {/* Minimal Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal/40 mb-8 uppercase tracking-wider">
            <Link href="/" className="hover:text-forest transition-colors">Home</Link>
            <Icon icon="solar:alt-arrow-right-linear" className="w-3 h-3" />
            <Link href="/shop" className="hover:text-forest transition-colors">Shop</Link>
            <Icon icon="solar:alt-arrow-right-linear" className="w-3 h-3" />
            <span className="text-forest font-bold">{product.name}</span>
          </div>

          {/* Product Showcase Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-20">

            {/* Gallery Column */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-square rounded-[16px] overflow-hidden bg-white border border-[#1b1c1a]/5 shadow-sm"
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.tags.includes("Organic") && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[#ccf078] text-[#061907] text-[10px] font-bold uppercase tracking-wider rounded-[4px] shadow-sm">
                    100% Certified Organic
                  </span>
                )}
              </motion.div>

              {/* Thumbnails strip */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveImage(product.image)}
                  className={`w-20 h-20 rounded-[8px] overflow-hidden border-2 bg-white transition-all cursor-pointer ${activeImage === product.image ? "border-forest scale-95 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                >
                  <img src={product.image} alt="Main" className="w-full h-full object-cover" />
                </button>
                {/* Showcase presets/alternates */}
                {uploadPresets.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-20 rounded-[8px] overflow-hidden border-2 bg-white transition-all cursor-pointer ${activeImage === imgUrl ? "border-forest scale-95 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info / Metadata Column */}
            <div className="lg:col-span-6 flex flex-col">

              {/* Category tag */}
              <span className="text-xs font-bold uppercase tracking-widest text-[#4d6700] mb-2">
                {product.categoryLabel}
              </span>

              {/* Title (Source Serif 4) */}
              <h1 className="font-playfair text-3xl md:text-4.5xl font-bold tracking-tight text-[#061907] leading-tight mb-4">
                {product.name}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-[#4d6700]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} icon="solar:star-bold" className="w-4 h-4" />
                  ))}
                </div>
                <span className="text-xs font-bold text-charcoal">{ratingAverage} / 5.0</span>
                <span className="text-xs font-medium text-charcoal/40">({totalReviewsCount} Verified Reviews)</span>
              </div>

              {/* Price section */}
              <div className="flex items-baseline gap-3 mb-6 border-b border-[#1b1c1a]/5 pb-6">
                <span className="text-2xl font-bold text-[#061907] font-inter">
                  {product.formattedPrice}
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-medium text-charcoal/40 line-through font-inter">
                    {product.originalPrice}
                  </span>
                )}
                <span className="ml-2 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-moss bg-sage/20 uppercase rounded">
                  TAX INCLUDED
                </span>
              </div>

              {/* Short description */}
              <p className="text-sm text-charcoal/70 leading-relaxed font-medium mb-8">
                {product.description}
              </p>

              {/* Quantity and Cart CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Quantity Control */}
                <div className="flex items-center justify-between border border-[#1b1c1a]/10 bg-white rounded-[16px] p-2 min-w-[130px]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1b1c1a]/5 transition-colors cursor-pointer"
                  >
                    <Icon icon="solar:minus-linear" className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-sm w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1b1c1a]/5 transition-colors cursor-pointer"
                  >
                    <Icon icon="solar:add-linear" className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow inline-flex items-center justify-center gap-2 bg-[#061907] hover:bg-[#1a2e1a] text-white text-xs font-semibold uppercase tracking-wider py-4 px-8 rounded-[16px] active:scale-98 transition-all shadow-sm cursor-pointer"
                >
                  <Icon icon="solar:cart-large-2-linear" className="w-4 h-4" />
                  Add to Cart Ritual
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-4 border-t border-[#1b1c1a]/5 pt-6 text-xs text-charcoal/60">
                <div className="flex items-center gap-2.5 font-semibold">
                  <Icon icon="solar:shield-check-linear" className="w-5 h-5 text-forest" />
                  <span>100% Pesticide Free</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold">
                  <Icon icon="solar:leaf-linear" className="w-5 h-5 text-forest" />
                  <span>Sustainable Harvest</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold">
                  <Icon icon="solar:box-linear" className="w-5 h-5 text-forest" />
                  <span>Rajasthan Single Origin</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold">
                  <Icon icon="solar:fire-linear" className="w-5 h-5 text-forest" />
                  <span>Nutrients Preserved</span>
                </div>
              </div>

            </div>

          </div>

          {/* Specs Sheet & Details Section */}
          <div className="bg-white rounded-[16px] border border-[#1b1c1a]/5 shadow-none p-6 md:p-10 mb-20">
            <h3 className="font-playfair text-xl md:text-2xl font-bold text-[#061907] mb-6">
              Botanical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between py-3 border-b border-[#1b1c1a]/5 font-medium">
                  <span className="text-charcoal/50">Origin Source</span>
                  <span className="text-[#061907] font-semibold">{product.details.origin}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#1b1c1a]/5 font-medium">
                  <span className="text-charcoal/50">Ingredients</span>
                  <span className="text-[#061907] font-semibold">{product.details.ingredients}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#1b1c1a]/5 font-medium">
                  <span className="text-charcoal/50">Preparation Time</span>
                  <span className="text-[#061907] font-semibold">{product.details.prepTime}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-center">
                <span className="text-xs font-bold text-[#4d6700] uppercase tracking-wider mb-1">
                  HIGHLIGHTED BENEFITS
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.details.nutrients.map((nut, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 bg-[#FAF9F6] border border-[#1b1c1a]/5 rounded-[6px] text-xs text-charcoal font-semibold flex items-center gap-2"
                    >
                      <Icon icon="solar:check-circle-linear" className="w-3.5 h-3.5 text-forest" />
                      {nut}
                    </span>
                  ))}
                </div>
              </div>
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
                      <span className="text-[10px] font-medium text-charcoal/40 uppercase tracking-wider">
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
