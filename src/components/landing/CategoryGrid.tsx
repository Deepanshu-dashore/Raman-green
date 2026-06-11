"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { categoriesApi } from "@/lib/api/categories";

interface CategoryItem {
  title: string;
  wellnessTag: string;
  image: string;
  href: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    title: "Heritage Seeds",
    wellnessTag: "VITALITY",
    image: "/category_seeds.png",
    href: "/shop?category=seeds",
  },
  {
    title: "Organic Crops",
    wellnessTag: "PERFORMANCE",
    image: "/category_crops.png",
    href: "/shop?category=crops",
  },
  {
    title: "Artisanal Dry Foods",
    wellnessTag: "HERITAGE",
    image: "/category_dry_foods.png",
    href: "/shop?category=dry-foods",
  },
  {
    title: "Instant Food Grains",
    wellnessTag: "PURITY",
    image: "/category_instant.png",
    href: "/shop?category=instant",
  },
];

export default function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(320);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch categories using Axios/API wrapper
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          const mapped = response.data.map((cat: any, index: number) => {
            const name = cat.name || "";
            const normalized = name.toLowerCase().trim();
            const tagMap: Record<string, string> = {
              "heritage seeds": "VITALITY",
              "organic crops": "PERFORMANCE",
              "artisanal dry foods": "HERITAGE",
              "instant food grains": "PURITY",
            };
            const defaultTags = ["VITALITY", "PERFORMANCE", "HERITAGE", "PURITY", "NATURAL", "ORGANIC"];
            const wellnessTag = tagMap[normalized] || defaultTags[index % defaultTags.length];

            return {
              title: name,
              wellnessTag,
              image: cat.image || "/category_seeds.png",
              href: `/shop?category=${cat.slug || ""}`,
            };
          });
          setCategories(mapped);
          setCurrentIndex(mapped.length);
        } else {
          setCategories(DEFAULT_CATEGORIES);
          setCurrentIndex(DEFAULT_CATEGORIES.length);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(DEFAULT_CATEGORIES);
        setCurrentIndex(DEFAULT_CATEGORIES.length);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const extendedCategories = categories.length > 0 ? [...categories, ...categories, ...categories] : [];

  // Measure card sizes and gaps dynamically on load/resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardWidth(230); // Very compact mobile width for peeking
      } else if (window.innerWidth < 1024) {
        setCardWidth(260);
      } else {
        // Fits all 4 categories completely side-by-side inside the 1152px inner container content width!
        // 4 * 268px + 3 * 20px (gap-5) = 1132px, which fits beautifully.
        setCardWidth(268);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-sliding logic with pause-on-hover
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered, currentIndex]);

  // Snapping logic for seamless infinite scroll loop
  useEffect(() => {
    const totalItems = categories.length;
    if (totalItems === 0) return;
    
    // Snapping forward: if we scroll into the third block, snap instantly to the second (middle) block
    if (currentIndex >= totalItems * 2) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(currentIndex - totalItems);
      }, 500); // matches Framer Motion transition duration
      return () => clearTimeout(timeout);
    }
    
    // Snapping backward: if we scroll below the middle block into the first block, snap instantly to the second block
    if (currentIndex < totalItems) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(currentIndex + totalItems);
      }, 500);
      return () => clearTimeout(timeout);
    }
    
    setIsTransitioning(true);
  }, [currentIndex, categories.length]);

  const handleNext = () => {
    if (!isTransitioning || isLoading) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!isTransitioning || isLoading) return;
    setCurrentIndex((prev) => prev - 1);
  };

  return (
    <section className="py-20 md:py-28 storefront bg-cream text-charcoal overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16">
        
        {/* Header Block exactly styled like design image */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8FA382] block mb-3">
            Shop by Category
          </span>
          <h2 className="font-playfair text-3.5xl md:text-5xl font-semibold text-forest tracking-tight leading-tight">
            Browse our Collections
          </h2>
        </div>

        {/* Carousel Slider Container */}
        <div 
          className="relative group/carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Previous Button (Fades in on Hover) */}
          <button
            onClick={handlePrev}
            disabled={isLoading}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-forest hover:text-white shadow-md transition-all duration-300 pointer-events-none opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto group-hover/carousel:translate-x-4 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            aria-label="Previous categories"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="w-5 h-5" />
          </button>

          {/* Next Button (Fades in on Hover) */}
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-forest hover:text-white shadow-md transition-all duration-300 pointer-events-none opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto group-hover/carousel:-translate-x-4 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            aria-label="Next categories"
          >
            <Icon icon="solar:alt-arrow-right-linear" className="w-5 h-5" />
          </button>

          {/* Viewport for smooth sliding */}
          <div ref={containerRef} className="overflow-hidden px-2 -mx-2 pb-4">
            {isLoading ? (
              <div className="flex gap-5">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={`skeleton-${index}`}
                    style={{ width: `${cardWidth}px` }}
                    className="shrink-0 py-2 h-[290px] md:h-[340px]"
                  >
                    <div className="relative h-full w-full rounded-2xl bg-charcoal/5 border border-charcoal/10 overflow-hidden flex flex-col justify-end p-6 animate-pulse">
                      {/* Tag skeleton */}
                      <div className="w-16 h-4 bg-charcoal/15 rounded mb-3" />
                      {/* Title skeleton */}
                      <div className="w-28 h-5 bg-charcoal/20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                animate={{ x: -currentIndex * (cardWidth + 20) }}
                transition={
                  isTransitioning 
                    ? { type: "spring", stiffness: 180, damping: 24 } 
                    : { duration: 0 } // Snap instantly without animation
                }
                className="flex gap-5"
              >
                {extendedCategories.map((cat, i) => (
                  <div
                    key={`${cat.title}-${i}`}
                    style={{ width: `${cardWidth}px` }}
                    className="shrink-0 py-2 h-[290px] md:h-[340px]" // Compact elegant height allowing 4 to fit perfectly side-by-side
                  >
                    <Link 
                      href={cat.href} 
                      className="group block relative h-full rounded-2xl overflow-hidden shadow-sm border border-gray-100/50"
                    >
                      {/* Background Category Image */}
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                      />

                      {/* Dark gradient overlay for text legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/90 pointer-events-none" />

                      {/* Content text and green tags bottom-left overlay */}
                      <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none">
                        <span className="inline-block px-3 py-1.5 mb-3 text-[9px] font-black uppercase tracking-[0.18em] bg-[#C9EC6F] text-forest rounded font-inter">
                          {cat.wellnessTag}
                        </span>
                        <h3 className="font-inter font-bold text-white text-base md:text-lg tracking-wider uppercase">
                          {cat.title}
                        </h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Navigation Dots Indicator for the main 4 categories */}
          {!isLoading && categories.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {categories.map((_, i) => {
                const activeDotIndex = (currentIndex - categories.length) % categories.length;
                const isDotActive = activeDotIndex === i || (activeDotIndex < 0 && (activeDotIndex + categories.length) === i);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setIsTransitioning(true);
                      setCurrentIndex(i + categories.length);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      isDotActive
                        ? "w-6 bg-forest"
                        : "w-1.5 bg-charcoal/20 hover:bg-charcoal/40"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                );
              })}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
