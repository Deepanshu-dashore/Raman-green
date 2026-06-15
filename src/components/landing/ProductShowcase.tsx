"use client";

import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
export default function ProductShowcase() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(280);
  const [visibleItems, setVisibleItems] = useState(4);

  // Fetch dynamic featured products on mount
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products/minimal?featured=true");
        if (res.ok) {
          const json = await res.json();
          const productsArray = Array.isArray(json.data) ? json.data : json.data?.products;
          if (json.success && Array.isArray(productsArray) && productsArray.length > 0) {
            setProducts(productsArray);
          }
        }
      } catch (err) {
        console.error("Failed to fetch featured products from API:", err);
      }
    }
    fetchFeatured();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Determine visible items per page (1 on mobile, 2 on tablet, 3 on sm-desktop, 4 on desktop)
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 768) {
        setVisibleItems(2);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(3);
      } else {
        setVisibleItems(4);
      }

      // Update card width measurement
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth);
      }
    };

    handleResize();
    // Use timeout to allow layout to settle before initial measurement
    const timeout = setTimeout(handleResize, 100);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, []);

  const maxIndex = Math.max(0, products.length - visibleItems);

  // Clamp current index on resizing
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [visibleItems, maxIndex, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  // Math Snapping Logic for smooth drag releases
  const handleDragEnd = (event: any, info: any) => {
    const step = cardWidth + 16;
    const dragOffset = info.offset.x;
    const dragVelocity = info.velocity.x;
    
    // Calculate projected drag offset including velocity inertia
    const swipeThreshold = 50;
    const velocityThreshold = 500;
    
    if (Math.abs(dragOffset) > swipeThreshold || Math.abs(dragVelocity) > velocityThreshold) {
      // Inertia multiplier weight: 0.18s of velocity decay
      const projectedOffset = dragOffset + dragVelocity * 0.18;
      const cardsMoved = Math.round(projectedOffset / step);
      
      const targetIndex = currentIndex - cardsMoved;
      setCurrentIndex(Math.max(0, Math.min(targetIndex, maxIndex)));
    }
  };

  return (
    <section className="py-20 md:py-28 overflow-hidden bg-cream">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[11px] font-inter font-semibold uppercase tracking-wider text-moss bg-sage/30 px-3 py-1 rounded-full">
            OUR WELLNESS PICKS
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mt-3">
            Curated for Your Ritual
          </h2>
          <p className="text-sm font-inter text-charcoal/60 mt-3 max-w-lg mx-auto leading-relaxed">
            Discover our best-selling botanical blends and heritage seeds, perfectly portioned to
            elevate your daily wellness routine.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel select-none">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-forest hover:text-white shadow-md transition-all duration-300 pointer-events-none opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto group-hover/carousel:translate-x-4 -translate-x-2 disabled:opacity-0 disabled:pointer-events-none cursor-pointer`}
            aria-label="Previous items"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="w-5 h-5" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-forest hover:text-white shadow-md transition-all duration-300 pointer-events-none opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto group-hover/carousel:-translate-x-4 translate-x-2 disabled:opacity-0 disabled:pointer-events-none cursor-pointer`}
            aria-label="Next items"
          >
            <Icon icon="solar:alt-arrow-right-linear" className="w-5 h-5" />
          </button>

          {/* Scrolling items viewport */}
          <div className="overflow-hidden px-2 -mx-2 pb-4 cursor-grab active:cursor-grabbing">
            <motion.div
              drag="x"
              dragConstraints={{
                left: -maxIndex * (cardWidth + 16),
                right: 0
              }}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              animate={{ x: -currentIndex * (cardWidth + 16) }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="flex gap-4 touch-pan-y"
            >
              {products.map((product, i) => (
                <div
                  key={product.id}
                  ref={i === 0 ? cardRef : null}
                  className="w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-10.67px)] lg:w-[calc(25%-12px)] shrink-0 h-full py-2 select-none"
                >
                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image: product.image,
                      hoverImage: product.hoverImage,
                      tags: product.tags,
                    }}
                    index={i}
                  />
                </div>
              ))}
            </motion.div>
          </div>


        </div>
      </div>
    </section>
  );
}

