"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ProductCard from "@/components/landing/ProductCard";



export default function StorePage() {
  return (
    <Suspense fallback={
      <LandingLayout>
        <div className="storefront bg-cream min-h-screen flex items-center justify-center text-forest">
          <div className="flex flex-col items-center gap-3">
            <Icon icon="mdi:loading" className="animate-spin w-10 h-10" />
            <p className="text-sm font-semibold tracking-wider uppercase">Loading Collections...</p>
          </div>
        </div>
      </LandingLayout>
    }>
      <StoreContent />
    </Suspense>
  );
}

function StoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state from query params on mount/change
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const queryParam = searchParams.get("q");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("all");
    }

    if (queryParam) {
      setSearchQuery(queryParam);
    } else {
      setSearchQuery("");
    }
    setCurrentPage(1); // Reset to page 1 on query param change
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setCategories(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products from API based on parameters
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const catQuery = selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
        const searchQueryParam = searchQuery ? `&search=${searchQuery}` : "";
        const limit = 8;
        const res = await fetch(
          `/api/products/minimal?page=${currentPage}&limit=${limit}${catQuery}${searchQueryParam}&sortBy=${sortOption}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const productsArray = Array.isArray(json.data) ? json.data : json.data.products;
            const pagination = Array.isArray(json.data) ? null : json.data.pagination;
            setProducts(productsArray || []);
            setTotalPages(pagination?.pages || 1);
          }
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, sortOption, searchQuery, currentPage]);

  // Add to Cart
  const handleAddToCart = (product: any) => {
    try {
      const existingCart = localStorage.getItem("rg-cart");
      let cart = [];
      if (existingCart) {
        cart = JSON.parse(existingCart);
      }
      const priceNum = typeof product.price === "number" 
        ? product.price 
        : (parseFloat(product.price.replace(/[^\d.]/g, "")) || 0);

      cart.push({
        id: product.id,
        name: product.name,
        price: priceNum,
        image: product.image,
        category: product.category || "Organic",
      });
      localStorage.setItem("rg-cart", JSON.stringify(cart));
      localStorage.setItem("rg-cart-count", cart.length.toString());
      
      window.dispatchEvent(new Event("storage"));
      
      toast.success(`${product.name} added to cart!`);
    } catch (e) {
      toast.error("Failed to add product to cart.");
    }
  };

  // Update Category Selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/shop?${params.toString()}`);
  };

  // Clear Search Filters
  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setCurrentPage(1);
    router.push("/shop");
  };

  return (
    <LandingLayout>
      <div className="storefront bg-cream py-16 md:py-24 text-charcoal min-h-screen">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16">
          
          {/* Header Row: Title & Dropdown Filters */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12 border-b border-charcoal/5 pb-8">
            
            {/* Title Section */}
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5.5xl font-playfair font-extrabold tracking-tight text-forest mb-4">
                Store
              </h1>
              <p className="text-sm md:text-base text-charcoal/70 leading-relaxed font-medium">
                Discover our curated selection of heritage seeds, organic crops, and
                artisanal dry foods. Cultivated with respect for the land.
              </p>
            </div>

            {/* Filters Group */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Dropdown 1: Categories */}
              <div className="relative min-w-[200px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none text-charcoal font-semibold cursor-pointer appearance-none pr-10 focus:border-forest/20 focus:ring-0 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Dropdown 2: Sort */}
              <div className="relative min-w-[180px]">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none text-charcoal font-semibold cursor-pointer appearance-none pr-10 focus:border-forest/20 focus:ring-0 focus:outline-none"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="alpha">Alphabetical</option>
                  <option value="newest">New Season</option>
                </select>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                />
              </div>

            </div>

          </div>

          {/* Active Search/Filters Bar */}
          {(searchQuery || selectedCategory !== "all") && (
            <div className="flex items-center justify-between bg-white border border-gray-100 px-5 py-3 rounded-2xl mb-8 shadow-sm">
              <div className="flex items-center gap-2.5 flex-wrap text-xs text-charcoal/70 font-semibold">
                <Icon icon="solar:filter-linear" className="w-4 h-4 text-forest" />
                <span>Active Filters:</span>
                {selectedCategory !== "all" && (
                  <span className="bg-[#FAF9F6] border border-gray-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 capitalize text-forest">
                    Category: {selectedCategory}
                    <button onClick={() => handleCategoryChange("all")} className="hover:text-red-500 cursor-pointer">
                      <Icon icon="solar:close-circle-linear" className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-[#FAF9F6] border border-gray-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-forest">
                    Search: "{searchQuery}"
                    <button onClick={() => {
                      setSearchQuery("");
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("q");
                      router.push(`/shop?${params.toString()}`);
                    }} className="hover:text-red-500 cursor-pointer">
                      <Icon icon="solar:close-circle-linear" className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-xs text-forest hover:text-green-700 font-bold underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24 text-forest gap-3">
              <Icon icon="mdi:loading" className="animate-spin w-8 h-8" />
              <span className="text-sm font-semibold uppercase tracking-wider">Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="-mx-5 md:-mx-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-16">
              {products.map((product, idx) => (
                <div key={product.id} className="h-full">
                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image: product.image,
                      hoverImage: product.hoverImage,
                      tags: product.tags || [],
                    }}
                    index={idx}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center max-w-md mx-auto mb-16 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#FAF9F6] border border-gray-50 rounded-full flex items-center justify-center text-forest mb-4">
                <Icon icon="solar:magnifer-linear" className="w-7 h-7" />
              </div>
              <h3 className="font-playfair text-xl font-bold text-forest mb-2">No Products Found</h3>
              <p className="text-xs text-charcoal/50 leading-relaxed font-semibold max-w-xs mb-6">
                We couldn't find any products matching your active filters. Try refining your selection.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-forest text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl hover:bg-forest/90 cursor-pointer shadow-sm"
              >
                Reset Search
              </button>
            </div>
          )}

          {/* Database Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-charcoal/10 text-xs font-inter font-semibold text-charcoal bg-white hover:bg-forest hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-charcoal transition-all duration-200 cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Icon icon="solar:arrow-left-linear" className="w-4 h-4" />
                Previous
              </button>
              <span className="text-xs font-inter font-bold text-charcoal/60 bg-[#FAF9F6] border border-gray-100 px-3 py-2 rounded-xl">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-charcoal/10 text-xs font-inter font-semibold text-charcoal bg-white hover:bg-forest hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-charcoal transition-all duration-200 cursor-pointer flex items-center gap-1 shadow-sm"
              >
                Next
                <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </LandingLayout>
  );
}
