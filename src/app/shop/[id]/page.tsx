"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import LandingLayout from "@/components/landing/LandingLayout";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { productsData, Product, Review } from "@/constants/products";
import ProductCard from "@/components/landing/ProductCard";
import { useAppDispatch } from "@/store/hooks";
import { addItemToCart } from "@/store/cartSlice";
import AddedToCartToast from "@/components/shared/AddedToCartToast";
import { useApiQuery } from "@/hooks/useApiQuery";

interface DetailProduct extends Omit<Product, 'details' | 'category'> {
  id: string;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  originalPrice?: string;
  category: string;
  categoryLabel: string;
  subCategoryLabel?: string;
  image: string;
  hoverImage?: string;
  tags: string[];
  details: {
    origin: string;
    prepTime: string;
    ingredients: string;
    nutrients: string[];
  };
  reviews: Review[];
  variants?: any[];
  spaceification?: any[];
  certificatesList?: string[];
  cultivationCities?: string[];
  cultivation?: string;
  declaration?: string;
}

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
const getProductTabContent = (prod: DetailProduct) => {
  const custom = tabContentMap[prod.id];
  if (custom) return custom;

  // Resolve ingredients description dynamically if it's a real DB product
  const ingredientsDesc = prod.details?.ingredients || 
    ((prod as any).ingredients && (prod as any).ingredients.length > 0
      ? `Contains: ${(prod as any).ingredients.join(", ")}.`
      : `100% pure organic ${(prod as any).brand || "Raman Green"} ${prod.name}.`);

  const originText = prod.details?.origin || (prod as any).cultivationOrSeason || "Rajasthan Orchards";
  const cultivationText = (prod as any).cultivation || "Direct Trade Organic";

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
      rows: (() => {
        const provenanceRows = [];
        if (prod.categoryLabel) {
          provenanceRows.push({ label: "Category", value: prod.categoryLabel });
        }
        if (prod.subCategoryLabel) {
          provenanceRows.push({ label: "Sub Category", value: prod.subCategoryLabel });
        }
        if (prod.cultivation) {
          provenanceRows.push({ label: "Cultivation Type", value: prod.cultivation });
        }
        if (prod.cultivationCities && prod.cultivationCities.length > 0) {
          provenanceRows.push({ label: "Cultivation Cities", value: prod.cultivationCities.join(", ") });
        }
        if (prod.certificatesList && prod.certificatesList.length > 0) {
          provenanceRows.push({ label: "Certificates", value: prod.certificatesList.join(", ") });
        }
        if (prod.declaration) {
          provenanceRows.push({ label: "Declarations / Features", value: prod.declaration });
        }
        if (prod.spaceification && prod.spaceification.length > 0) {
          prod.spaceification.forEach((s: any) => {
            provenanceRows.push({ label: s.title, value: s.value });
          });
        }
        if (provenanceRows.length === 0) {
          provenanceRows.push(
            { label: "Origin", value: originText },
            { label: "Purity State", value: "Certified Pesticide-Free" },
            { label: "Cultivation", value: cultivationText }
          );
        }
        return provenanceRows;
      })(),
      description: `Nurtured with ancient agrarian wisdom in Rajasthan's organic agricultural belts. Packed immediately upon harvest under clean, clinical conditions to secure maximum natural vitality.`,
      pledgeTitle: "FARM TO BOWL",
      pledgeDesc: "Every purchase directly supports our community cooperative of sustainable local heritage farmers."
    },
    tips: {
      tipsTitle: "Usage Tips",
      rows: [
        { label: "Usage", value: prod.details?.prepTime || "Ready to eat" },
        { label: "Ingredients", value: ingredientsDesc },
        { label: "Storage", value: "Cool, dry airtight container" }
      ],
      description: `Our raw ${prod.name} requires minimal culinary effort. Excellent for quick wellness rituals, gourmet recipes, or enriching standard daily meals.`,
      prepTitle: "GOURMET ADVICE",
      prepDesc: "Incorporate organic honey or warm botanical milk to draw out deeper natural flavors."
    }
  };
};

const renderValue = (value: string, label: string) => {
  if (typeof value !== "string") return value;

  // Split by bullet point if contains •
  if (value.includes("•")) {
    const items = value.split("•").map(item => item.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1.5 mt-0.5">
        {items.map((item, idx) => (
          <span 
            key={idx} 
            className="inline-flex items-center px-2 py-0.5 rounded bg-[#4d6700]/5 text-[#4d6700] text-[10px] font-bold tracking-wide uppercase border border-[#4d6700]/10"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  // Split by comma for list labels
  const listLabels = ["certificates", "cultivation cities", "cultivation_city", "ingredients", "cultivation type"];
  const isListLabel = listLabels.includes(label.toLowerCase()) || label.includes("Certificates") || label.includes("Cities");
  if (isListLabel && value.includes(",")) {
    const items = value.split(",").map(item => item.trim()).filter(Boolean);
    if (items.length > 1) {
      return (
        <div className="flex flex-wrap gap-1.5 mt-0.5 font-inter">
          {items.map((item, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center px-2 py-0.5 rounded bg-charcoal/5 text-charcoal/80 text-[10px] font-semibold tracking-wide uppercase border border-charcoal/10"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }
  }

  return <span className="text-[#061907] font-bold text-left block whitespace-normal leading-relaxed">{value}</span>;
};

export default function ProductDetailPage({ params }: PageProps) {
  // Unwrap Next.js 15 params promise
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const dispatch = useAppDispatch();

  // Find target product
  const initialProduct = productsData.find((p) => p.id === productId) || productsData[6]; // Default to Premium Chia if not found

  // Caching GET Queries via useApiQuery
  const { data: productData, isLoading: isProductLoading, error: productError } = useApiQuery<any>(
    ["product", productId],
    `/api/products/${productId}`
  );

  const { data: reviewsData } = useApiQuery<any[]>(
    ["reviews", productId],
    `/api/products/${productId}/reviews`
  );

  // State
  const [activeImage, setActiveImage] = useState<string>(initialProduct.image);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWeight, setSelectedWeight] = useState<string>("250 g");
  const [activeTab, setActiveTab] = useState<"nutrition" | "provenance" | "tips">("nutrition");
  const [reviews, setReviews] = useState<Review[]>(initialProduct.reviews);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState<boolean>(false);
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  const isLoading = isProductLoading;

  // Memoized product transformation to match DetailProduct schema format
  const product = useMemo<DetailProduct>(() => {
    if (!productData) {
      return productsData.find((p) => p.id === productId) || productsData[6];
    }
    const dbProd = productData;
    const variants = dbProd.variants || [];
    const firstVariant = variants[0];
    
    let mainImage = dbProd.image || "";
    if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
      mainImage = firstVariant.images[0];
    }

    const basePrice = firstVariant ? (firstVariant.discountedPrice || firstVariant.basePrice || 0) : 0;

    const certificatesList = dbProd.certificates && Array.isArray(dbProd.certificates)
      ? dbProd.certificates.map((c: any) => c.name).filter(Boolean)
      : [];

    const cultivationCities = dbProd.cultivation_city && Array.isArray(dbProd.cultivation_city)
      ? dbProd.cultivation_city.map((city: any) => city.name).filter(Boolean)
      : [];

    return {
      id: dbProd.slug || dbProd._id,
      name: dbProd.name,
      description: dbProd.description || "",
      price: basePrice,
      formattedPrice: `₹${basePrice}`,
      category: dbProd.category?.slug || "organic",
      categoryLabel: dbProd.category?.name || "Organic",
      subCategoryLabel: dbProd.subCategory?.name,
      image: mainImage,
      hoverImage: (firstVariant && firstVariant.images && firstVariant.images.length > 1) ? firstVariant.images[1] : undefined,
      tags: dbProd.tags || [],
      details: {
        origin: dbProd.cultivationOrSeason || "Rajasthan Orchards",
        prepTime: (firstVariant && firstVariant.usageInstructions && firstVariant.usageInstructions.length > 0) 
          ? firstVariant.usageInstructions[0] 
          : "Ready to eat",
        ingredients: dbProd.ingredients?.join(", ") || "100% Organic",
        nutrients: dbProd.spaceification?.map((s: any) => `${s.title}: ${s.value}`) || []
      },
      reviews: [],
      variants: variants,
      spaceification: dbProd.spaceification || [],
      certificatesList,
      cultivationCities,
      cultivation: dbProd.cultivation,
      declaration: dbProd.declaration
    };
  }, [productData, productId]);

  // Set default weight when product variants load
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const inStockVariant = product.variants.find((v: any) => (v.stock ?? 0) > 0);
      const targetVariant = inStockVariant || product.variants[0];
      const weightText = `${targetVariant.weight} ${targetVariant.unit?.name || 'g'}`;
      setSelectedWeight(weightText);
    } else {
      setSelectedWeight("250 g");
    }
  }, [product.variants]);

  // Synchronize reviews data with local state to support seamless helpful votes and submissions
  useEffect(() => {
    if (reviewsData && Array.isArray(reviewsData)) {
      const mappedReviews: Review[] = reviewsData.map((r: any) => ({
        id: r._id,
        author: r.userId?.name || "Anonymous User",
        avatarInitials: (r.userId?.name || "U")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }),
        headline: r.headline || "Feedback",
        text: r.review,
        images: r.attatchments && r.attatchments.length > 0 ? r.attatchments : undefined,
        helpfulCount: 0,
        isVerified: true
      }));
      setReviews(mappedReviews);
    } else if (productError) {
      const fallback = productsData.find((p) => p.id === productId) || productsData[6];
      setReviews(fallback.reviews);
    }
  }, [reviewsData, productId, productError]);

  // Find current active variant based on selected weight/unit text
  const getActiveVariant = () => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.find((v: any) => {
        const weightText = `${v.weight} ${v.unit?.name || 'g'}`;
        return weightText === selectedWeight;
      }) || product.variants[0];
    }
    return null;
  };

  const activeVariant = getActiveVariant();
  const isOutOfStock = activeVariant ? (activeVariant.stock <= 0) : false;

  // Dynamic pricing based on weight selection
  const getPriceForWeight = () => {
    if (selectedWeight === "500 g") return product.price;
    if (selectedWeight === "1 kg") return Math.round(product.price * 1.8);
    return Math.round(product.price * 0.55); // 250 g
  };

  const currentPrice = activeVariant 
    ? (activeVariant.discountedPrice > 0 && activeVariant.discountedPrice < activeVariant.basePrice 
        ? activeVariant.discountedPrice 
        : activeVariant.basePrice)
    : getPriceForWeight();

  const formattedPriceText = `₹${currentPrice.toLocaleString("en-IN")}`;
  const tabData = getProductTabContent(product);

  const getTabRows = () => {
    return activeTab === "nutrition"
      ? tabData.nutrition.macros
      : activeTab === "provenance"
        ? tabData.provenance.rows
        : tabData.tips.rows;
  };

  const currentTabRows = getTabRows();
  const halfLength = Math.ceil(currentTabRows.length / 2);
  const leftTabRows = currentTabRows.slice(0, halfLength);
  const rightTabRows = currentTabRows.slice(halfLength);

  const getWeightOptions = () => {
    if (product.variants) {
      if (product.variants.length > 0) {
        return product.variants.map((v: any) => ({
          label: `${v.weight} ${v.unit?.name || 'g'}`,
          stock: v.stock ?? 0,
        }));
      }
      return [];
    }
    return [
      { label: "250 g", stock: 10 },
      { label: "500 g", stock: 10 },
      { label: "1 kg", stock: 10 }
    ];
  };

  const weightOptions = getWeightOptions();

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
  const [formRating, setFormRating] = useState<number>(1);
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

  const getThumbnails = (): string[] => {
    if (activeVariant && activeVariant.images && activeVariant.images.length > 0) {
      return activeVariant.images;
    }
    return [product.image, ...uploadPresets];
  };

  const thumbnails = getThumbnails();

  const getUsageBulletPoints = (): string[] => {
    if (activeVariant && activeVariant.usageInstructions && activeVariant.usageInstructions.length > 0) {
      return activeVariant.usageInstructions;
    }
    if ((tabData.tips as any).bulletPoints) {
      return (tabData.tips as any).bulletPoints;
    }
    if (tabData.tips.description) {
      return tabData.tips.description
        .split(".")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => `${s}.`);
    }
    return [];
  };

  // Fetch currently authenticated user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((resJson) => {
        if (resJson.success && resJson.data) {
          setCurrentUser(resJson.data);
          setFormAuthor(resJson.data.name);
        }
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, []);

  // Update image when product changes
  useEffect(() => {
    setActiveImage(product.image);
  }, [product]);

  // Update active image when selected weight/variant changes
  useEffect(() => {
    const activeVar = getActiveVariant();
    if (activeVar && activeVar.images && activeVar.images.length > 0) {
      setActiveImage(activeVar.images[0]);
    }
  }, [selectedWeight]);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      const activeVar = getActiveVariant();
      
      const variantObj = activeVar || {
        weight: selectedWeight,
        price: currentPrice,
        sku: `${product.id}-${selectedWeight}`,
        images: activeVar?.images ?? []
      };

      const productInfo = {
        name: product.name,
        // Use variant specific image if available, otherwise fallback to main product image
        image: (activeVar && activeVar.images && activeVar.images.length > 0) ? activeVar.images[0] : product.image,
        category: product.categoryLabel
      };

      const res = await dispatch(
        addItemToCart({
          productId: product.id,
          variant: variantObj,
          quantity: quantity,
          productInfo
        })
      ).unwrap();

      // Trigger custom attractive toast below navigation bar
      toast.custom(
        (t) => (
          <AddedToCartToast
            visible={t.visible}
            id={t.id}
            productName={product.name}
            productImage={product.image}
            variantWeight={selectedWeight}
            variantPrice={currentPrice}
            quantity={quantity}
            cartTotalItems={res.totalItems ?? 0}
            cartTotalPrice={res.totalPrice ?? 0}
          />
        ),
        {
          duration: 6000,
          position: "top-right",
        }
      );
    } catch (e: any) {
      toast.error(typeof e === "string" ? e : (e.message || "Failed to add items to cart."));
    } finally {
      setIsAddingToCart(false);
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

  const handleWriteReviewClick = () => {
    if (!currentUser) {
      toast.error("Please login to write a review.");
      return;
    }
    setIsWriteReviewOpen(true);
  };

  // Handle Review Submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please login to write a review.");
      return;
    }
    if (!formHeadline.trim() || !formText.trim()) {
      toast.error("Please fill in all required review fields.");
      return;
    }

    const toastId = toast.loading("Submitting your review...");

    fetch(`/api/products/${product.id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: formRating,
        headline: formHeadline,
        review: formText,
        attatchments: attachedImages
      })
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then(json => { throw new Error(json.message || "Failed to submit review."); });
      })
      .then((json) => {
        toast.dismiss(toastId);
        if (json.success && json.data) {
          const r = json.data;
          const newReview: Review = {
            id: r._id,
            author: r.userId?.name || currentUser.name || "You",
            avatarInitials: (r.userId?.name || currentUser.name || "U")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            rating: r.rating,
            date: "Just now",
            headline: r.headline,
            text: r.review,
            images: r.attatchments && r.attatchments.length > 0 ? r.attatchments : undefined,
            helpfulCount: 0,
            isVerified: true,
          };
          setReviews((prev) => [newReview, ...prev]);
          setIsWriteReviewOpen(false);
          toast.success("Review submitted! Thank you for your feedback.");
          
          // Reset Form
          setFormHeadline("");
          setFormText("");
          setFormRating(1);
          setAttachedImages([]);
        } else {
          toast.error(json.message || "Failed to submit review.");
        }
      })
      .catch((err) => {
        toast.dismiss(toastId);
        toast.error(err.message || "An error occurred. Please try again.");
      });
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

  if (isLoading) {
    return (
      <LandingLayout>
        <div className="bg-[#fbf9f6] text-[#1b1c1a] min-h-screen py-10 md:py-16 font-inter animate-pulse">
          <div className="max-w-[1280px] mx-auto px-5">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-8">
              <div className="h-3 w-12 bg-charcoal/10 rounded-md"></div>
              <div className="h-3.5 w-3.5 bg-charcoal/10 rounded-full"></div>
              <div className="h-3 w-16 bg-charcoal/10 rounded-md"></div>
              <div className="h-3.5 w-3.5 bg-charcoal/10 rounded-full"></div>
              <div className="h-3 w-24 bg-charcoal/10 rounded-md"></div>
            </div>

            {/* Showcase Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-20">
              {/* Gallery Column */}
              <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
                {/* Thumbnails (3 items) */}
                <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-[8px] bg-charcoal/10"></div>
                  ))}
                </div>
                {/* Main Image */}
                <div className="flex-grow aspect-square rounded-[16px] bg-charcoal/10"></div>
              </div>

              {/* Info Column */}
              <div className="lg:col-span-5 flex flex-col">
                {/* Category / Rating Row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-5 w-24 bg-charcoal/10 rounded-md"></div>
                  <div className="h-3.5 w-32 bg-charcoal/10 rounded-md"></div>
                </div>
                {/* Title */}
                <div className="h-10 w-3/4 bg-charcoal/10 rounded-md mb-4"></div>
                {/* Price */}
                <div className="h-8 w-1/3 bg-charcoal/10 rounded-md mb-6"></div>
                {/* Description Lines */}
                <div className="space-y-2.5 mb-8">
                  <div className="h-3 w-full bg-charcoal/10 rounded-md"></div>
                  <div className="h-3 w-full bg-charcoal/10 rounded-md"></div>
                  <div className="h-3 w-2/3 bg-charcoal/10 rounded-md"></div>
                </div>
                {/* Weight Options */}
                <div className="mb-6">
                  <div className="h-3.5 w-28 bg-charcoal/10 rounded-md mb-3"></div>
                  <div className="flex gap-3">
                    {[1, 2, 3].map((w) => (
                      <div key={w} className="h-10 w-20 bg-charcoal/10 rounded-full"></div>
                    ))}
                  </div>
                </div>
                {/* Quantity and CTA */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-32 bg-charcoal/10 rounded-full"></div>
                  <div className="h-12 flex-grow bg-charcoal/10 rounded-[8px]"></div>
                </div>
                {/* Trust Badges Grid */}
                <div className="grid grid-cols-2 gap-5 border-t border-charcoal/5 pt-8">
                  {[1, 2, 3, 4].map((b) => (
                    <div key={b} className="flex items-center gap-3">
                      <div className="w-5.5 h-5.5 rounded-full bg-charcoal/10"></div>
                      <div className="h-3 w-24 bg-charcoal/10 rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Accordion Details */}
            <div className="border-t border-charcoal/5 pt-12 mb-20">
              <div className="flex gap-8 mb-6 border-b border-[#1b1c1a]/5 pb-3">
                <div className="h-5 w-24 bg-charcoal/10 rounded-md"></div>
                <div className="h-5 w-24 bg-charcoal/10 rounded-md"></div>
                <div className="h-5 w-24 bg-charcoal/10 rounded-md"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-charcoal/5">
                      <div className="h-3.5 w-20 bg-charcoal/10 rounded-md"></div>
                      <div className="h-3.5 w-32 bg-charcoal/10 rounded-md"></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 bg-charcoal/10 rounded-md"></div>
                  <div className="h-3.5 w-full bg-charcoal/10 rounded-md"></div>
                  <div className="h-3.5 w-full bg-charcoal/10 rounded-md"></div>
                  <div className="h-3.5 w-4/5 bg-charcoal/10 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LandingLayout>
    );
  }

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
            <span className="hover:text-forest transition-colors">{product.categoryLabel}</span>
            {product.subCategoryLabel && (
              <>
                <Icon icon="solar:alt-arrow-right-linear" className="w-3 h-3" />
                <span className="hover:text-forest transition-colors">{product.subCategoryLabel}</span>
              </>
            )}
            <Icon icon="solar:alt-arrow-right-linear" className="w-3 h-3" />
            <span className="text-forest font-bold">{product.name}</span>
          </div>

          {/* Product Showcase Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-20">

            {/* Gallery Column: Vertical thumbnails on left for desktop, horizontal on bottom for mobile */}
            <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">

              {/* Thumbnails list */}
              <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 shrink-0 select-none overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 no-scrollbar">
                {thumbnails.map((imgUrl, i) => (
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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4d6700] bg-sage/35 px-2.5 py-0.5 rounded-[4px]">
                  {product.categoryLabel}
                </span>
                {product.subCategoryLabel && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-forest/10 px-2.5 py-0.5 rounded-[4px]">
                    {product.subCategoryLabel}
                  </span>
                )}
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
              <div className="mb-6 flex items-baseline gap-2.5 flex-wrap">
                <span className="font-inter text-xl md:text-2xl font-bold text-[#061907]">{formattedPriceText}</span>
                {activeVariant && activeVariant.discountedPrice > 0 && activeVariant.discountedPrice < activeVariant.basePrice && (
                  <span className="font-inter text-sm text-charcoal/40 line-through font-medium">
                    ₹{activeVariant.basePrice.toLocaleString("en-IN")}
                  </span>
                )}
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
                {weightOptions.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2.5 max-w-sm">
                    {weightOptions.map((opt) => {
                      const isSelected = selectedWeight === opt.label;
                      const isOptOutOfStock = opt.stock <= 0;
                      return (
                        <button
                          key={opt.label}
                          disabled={isOptOutOfStock}
                          onClick={() => setSelectedWeight(opt.label)}
                          className={`px-2.5 py-2.5 text-center text-xs font-semibold rounded-full border transition-all relative ${
                            isOptOutOfStock
                              ? "bg-transparent border-[#dbdad7] text-charcoal/35 line-through opacity-50 cursor-not-allowed"
                              : isSelected
                                ? "bg-[#061907] border-[#061907] text-white font-bold cursor-pointer"
                                : "bg-transparent border-[#dbdad7] text-charcoal hover:border-charcoal/30 cursor-pointer"
                          }`}
                          title={isOptOutOfStock ? `${opt.label} (Out of Stock)` : opt.label}
                        >
                          {opt.label}
                          {isOptOutOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="w-full h-[1px] bg-charcoal/30 transform rotate-12" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-charcoal/40 italic">No option available</span>
                )}
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
                  disabled={isAddingToCart || isOutOfStock}
                  className={`flex-grow h-12 inline-flex items-center justify-center gap-2 text-white text-[11px] font-bold uppercase tracking-wider rounded-[8px] active:scale-98 transition-all shadow-sm ${
                    isOutOfStock
                      ? "bg-charcoal/20 text-charcoal/40 cursor-not-allowed"
                      : "bg-forest hover:bg-forest/90 cursor-pointer"
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      ADDING TO CART...
                      <Icon icon="mdi:loading" className="animate-spin w-4.5 h-4.5" />
                    </>
                  ) : isOutOfStock ? (
                    <>
                      OUT OF STOCK
                      <Icon icon="lucide:slash" className="w-4.5 h-4.5" />
                    </>
                  ) : (
                    <>
                      ADD TO CART
                      <Icon icon="lucide:shopping-bag" className="w-4.5 h-4.5" />
                    </>
                  )}
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
                <div className="lg:col-span-12 bg-white rounded-[16px] border border-[#1b1c1a]/5 p-6 shadow-none flex flex-col gap-4">
                  <h4 className="font-playfair text-base font-bold text-[#061907]">
                    {activeTab === "nutrition"
                      ? tabData.nutrition.macroTitle
                      : activeTab === "provenance"
                        ? tabData.provenance.originTitle
                        : tabData.tips.tipsTitle}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0">
                    <div className="flex flex-col">
                      {leftTabRows.map((row, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-1 sm:grid-cols-[145px_1fr] lg:grid-cols-[170px_1fr] gap-x-4 gap-y-1 py-3 border-b border-[#1b1c1a]/5 text-xs font-semibold last:border-b-0 items-start"
                        >
                          <span className="text-charcoal/45 font-medium">{row.label}</span>
                          <div className="text-left w-full">
                            {renderValue(row.value, row.label)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      {rightTabRows.map((row, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-1 sm:grid-cols-[145px_1fr] lg:grid-cols-[170px_1fr] gap-x-4 gap-y-1 py-3 border-b border-[#1b1c1a]/5 text-xs font-semibold last:border-b-0 items-start"
                        >
                          <span className="text-charcoal/45 font-medium">{row.label}</span>
                          <div className="text-left w-full">
                            {renderValue(row.value, row.label)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Paragraph Description + Callout box */}
                <div className="lg:col-span-12 flex flex-col gap-6">

                  {/* Long Description Text */}
                  {activeTab === "tips" ? (
                    <ul className="list-disc pl-5 space-y-2.5 text-xs md:text-sm text-charcoal/70 leading-relaxed font-semibold">
                      {getUsageBulletPoints().map((bullet: string, i: number) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs md:text-sm text-charcoal/70 leading-relaxed font-semibold">
                      {activeTab === "nutrition"
                        ? tabData.nutrition.description
                        : tabData.provenance.description}
                    </p>
                  )}

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
                      hoverImage: recProd.hoverImage,
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
                onClick={handleWriteReviewClick}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#061907] hover:bg-[#1a2e1a] text-white text-[11px] font-inter font-bold uppercase tracking-wider rounded-full active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                WRITE A REVIEW
              </button>
            </div>

            {/* Reviews stream container */}
            <div className="flex flex-col gap-8">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-[#1b1c1a]/15 rounded-[20px] bg-white text-center shadow-xs">
                  <Icon icon="solar:chat-round-line-linear" className="w-12 h-12 text-[#4d6700]/40 mb-3" />
                  <h4 className="font-playfair text-base font-bold text-[#061907] mb-1">No reviews yet</h4>
                  <p className="text-xs text-charcoal/50 max-w-xs leading-relaxed font-semibold">
                    Be the first to share your thoughts about this product with the community!
                  </p>
                </div>
              ) : (
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
              )}
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
                    Your Nickname
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    disabled
                    value={currentUser?.name || ""}
                    className="w-full bg-gray-100 border border-[#1b1c1a]/15 rounded-[12px] px-4 py-3 text-xs font-semibold outline-none font-inter text-gray-500 cursor-not-allowed"
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
