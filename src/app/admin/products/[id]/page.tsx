"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

interface ProductViewPageProps {
  params: Promise<{ id: string }>;
}

const ProductViewPage = ({ params }: ProductViewPageProps) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeVariant, setActiveVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [selectedColor, setSelectedColor] = useState<string>("emerald");
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setProduct(json.data);
          const firstVariant = json.data?.variants?.[0] || null;
          setActiveVariant(firstVariant);
          const firstImg = firstVariant?.images?.[0] || json.data?.variants?.flatMap((v: any) => v.images || [])?.[0] || null;
          setActiveImage(firstImg);
          setActiveImageIndex(0);
          if (firstVariant?.packaging?.[0]) {
            const packId = typeof firstVariant.packaging[0] === 'object' ? firstVariant.packaging[0]._id : firstVariant.packaging[0];
            setSelectedPackaging(packId);
          } else {
            setSelectedPackaging(null);
          }
        } else {
          toast.error(json.message || "Failed to load product details.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("An error occurred while fetching product details.");
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const allImages: string[] = useMemo(() => {
    if (!product) return [];
    // Collect all unique variant images
    const imgs = product.variants?.flatMap((v: any) => v.images || []) || [];
    return Array.from(new Set(imgs));
  }, [product]);

  // Update active image index when active image changes
  useEffect(() => {
    if (activeImage) {
      const idx = allImages.indexOf(activeImage);
      if (idx > -1) {
        setActiveImageIndex(idx);
      }
    }
  }, [activeImage, allImages]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    const nextIdx = (activeImageIndex + 1) % allImages.length;
    setActiveImageIndex(nextIdx);
    setActiveImage(allImages[nextIdx]);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    const prevIdx = (activeImageIndex - 1 + allImages.length) % allImages.length;
    setActiveImageIndex(prevIdx);
    setActiveImage(allImages[prevIdx]);
  };

  const handleVariantChange = (variantId: string) => {
    const v = product?.variants?.find((item: any) => item._id === variantId);
    if (v) {
      setActiveVariant(v);
      if (v.images?.[0]) {
        setActiveImage(v.images[0]);
      }
      setQuantity(1);
      if (v.packaging?.[0]) {
        const packId = typeof v.packaging[0] === 'object' ? v.packaging[0]._id : v.packaging[0];
        setSelectedPackaging(packId);
      } else {
        setSelectedPackaging(null);
      }
    }
  };

  const stats = useMemo(() => {
    if (!product) return { priceLabel: "N/A", totalStock: 0 };
    const variants = product.variants || [];
    const prices = variants
      .map((v: any) => v.basePrice)
      .filter((p: number) => p != null);
    const totalStock = variants.reduce(
      (sum: number, v: any) => sum + (Number(v.stock) || 0),
      0
    );
    const min = prices.length ? Math.min(...prices) : null;
    const max = prices.length ? Math.max(...prices) : null;
    const priceLabel =
      min == null
        ? "N/A"
        : min === max
          ? `₹${min}`
          : `₹${min} – ₹${max}`;

    return {
      priceLabel,
      totalStock,
    };
  }, [product]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600" />
        <p className="text-sm font-semibold text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 shadow-inner">
          <Icon icon="lucide:alert-circle" className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Product not found</h2>
        <p className="text-sm text-slate-500">
          This product may have been removed or the link is invalid.
        </p>
        <button
          onClick={() => router.push("/admin/products")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-md"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Back to products
        </button>
      </div>
    );
  }

  const isOutOfStock = !activeVariant || Number(activeVariant.stock) <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-500">
      
      {/* 1. Header controls */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <button
          onClick={() => router.push("/admin/products")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors group"
        >
          <Icon icon="lucide:chevron-left" className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `/products/${product.slug}`);
              toast.success("Product link copied!");
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 shadow-sm"
            title="Copy Public Link"
          >
            <Icon icon="lucide:share-2" className="w-4.5 h-4.5" />
          </button>
          
          <button
            onClick={() => router.push(`/admin/products/edit/${productId}`)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 shadow-sm"
            title="Edit Base Product"
          >
            <Icon icon="lucide:edit-2" className="w-4.5 h-4.5" />
          </button>
          
          <div className="bg-slate-900 text-slate-100 px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-default select-none border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Published</span>
          </div>
        </div>
      </div>

      {/* 2. Main content area: Image Gallery (Left) & Product Customizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-sm group">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <Icon icon="lucide:image" className="w-16 h-16 mb-2" />
                <span className="text-xs font-semibold text-slate-400">No images available</span>
              </div>
            )}

            {/* Gallery Left/Right Overlays */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-950 shadow-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <Icon icon="lucide:chevron-left" className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-950 shadow-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <Icon icon="lucide:chevron-right" className="w-5 h-5" />
                </button>

                {/* Page Indicator Overlay */}
                <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-3 shadow-md">
                  <button onClick={prevImage} className="hover:text-emerald-400 transition-colors">
                    <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                  </button>
                  <span className="tabular-nums">
                    {activeImageIndex + 1} / {allImages.length}
                  </span>
                  <button onClick={nextImage} className="hover:text-emerald-400 transition-colors">
                    <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1 hide-scrollbar">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveImage(imgUrl);
                    setActiveImageIndex(idx);
                  }}
                  className={`w-18 h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all shadow-sm ${
                    activeImage === imgUrl
                      ? "border-emerald-600 ring-2 ring-emerald-600/20 scale-[0.98]"
                      : "border-slate-200/80 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Detail purchase block simulator */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-sky-50 border border-sky-100 text-sky-600 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                New
              </span>
              <span className={`text-xs font-black uppercase tracking-wide ${isOutOfStock ? "text-rose-600" : "text-emerald-600"}`}>
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Stars and reviews */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4].map((i) => (
                  <Icon key={i} icon="material-symbols:star" className="w-5 h-5" />
                ))}
                <Icon icon="material-symbols:star-half" className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 hover:underline cursor-pointer">
                (9.12k reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₹{activeVariant ? activeVariant.basePrice : stats.priceLabel}
            </span>
            {activeVariant?.discountedPrice && (
              <span className="text-sm font-semibold text-slate-400 line-through">
                ₹{activeVariant.discountedPrice}
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
              Price per pack
            </span>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed">
            {product.description || "Indulge in premium quality microgreens. Carefully curated to fit high dietary standards, grown organic under state-of-the-art standards."}
          </p>

          <hr className="border-slate-100" />

          {/* Color simulator */}
          <div className="space-y-2.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Theme / Variety ({selectedColor === "emerald" ? "Organic Green" : "Sunset Coral"})
            </span>
            <div className="flex items-center gap-3">
              {[
                { id: "emerald", color: "bg-emerald-500 ring-emerald-500/25" },
                { id: "coral", color: "bg-rose-400 ring-rose-400/25" }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`w-6 h-6 rounded-full ${c.color} transition-all duration-200 relative ${
                    selectedColor === c.id
                      ? "ring-4 scale-105 border border-white"
                      : "opacity-75 hover:opacity-100 hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Variant size/unit select chips */}
          {product.variants?.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-baseline">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Size / Weight Option
                </span>
                <button 
                  onClick={() => router.push(`/admin/products/edit/${productId}/variants`)} 
                  className="text-xs text-emerald-600 hover:underline font-bold"
                >
                  Size chart
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v: any) => {
                  const sizeLabel = [v.weight || v.value, v.unit?.shortName || v.unit?.name]
                    .filter(Boolean)
                    .join(" ");
                  const isSelected = activeVariant?._id === v._id;
                  return (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => handleVariantChange(v._id)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-extrabold ring-1 ring-emerald-500/10 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      {sizeLabel || v.sku}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Packaging option select chips */}
          {activeVariant?.packaging?.length > 0 && (
            <div className="space-y-2.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Packaging Variant
              </span>
              <div className="flex flex-wrap gap-2.5">
                {activeVariant.packaging.map((pack: any, pIdx: number) => {
                  const id = typeof pack === 'object' && pack ? pack._id : pack;
                  const label = typeof pack === 'object' && pack ? pack.name : `Packaging ${pIdx + 1}`;
                  const isSelected = selectedPackaging === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedPackaging(id)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-extrabold ring-1 ring-emerald-500/10 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity stepper simulator */}
          <div className="space-y-2.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Quantity
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 p-1">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(q => q - 1)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                >
                  <Icon icon="lucide:minus" className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-black tabular-nums text-slate-800">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock || quantity >= (activeVariant?.stock || 99)}
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                >
                  <Icon icon="lucide:plus" className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Available: {activeVariant ? activeVariant.stock : stats.totalStock}
              </span>
            </div>
          </div>


        </div>
      </div>

      {/* 3. Promotional Highlight Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 pt-10">
        {[
          {
            title: "100% Organic",
            desc: "Locally sourced microgreens and products direct from organic cultivation labs.",
            icon: "lucide:check-circle",
            color: "text-emerald-500 bg-emerald-50"
          },
          {
            title: "Fast Local Delivery",
            desc: "Fresh, healthy greens harvested on-demand and delivered straight to your door.",
            icon: "lucide:clock",
            color: "text-blue-500 bg-blue-50"
          },
          {
            title: "Quality Warranty",
            desc: "Guaranteed crop quality, certified lab standards, and 100% freshness insurance.",
            icon: "lucide:check-circle",
            color: "text-emerald-500 bg-emerald-50"
          }
        ].map((feat) => (
          <div key={feat.title} className="flex flex-col items-center text-center p-6 space-y-3 bg-slate-50/20 border border-slate-100 rounded-2xl shadow-sm">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${feat.color}`}>
              <Icon icon={feat.icon} className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-800 text-sm tracking-wide">
              {feat.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed px-2">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>

      {/* 4. Tabbed Area (Description / Specifications vs Reviews) */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-8 py-4 text-xs font-bold transition-all relative border-r border-slate-100 ${
              activeTab === "description"
                ? "bg-white text-slate-900 border-b-2 border-b-slate-900"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/40"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-8 py-4 text-xs font-bold transition-all relative ${
              activeTab === "reviews"
                ? "bg-white text-slate-900 border-b-2 border-b-slate-900"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/40"
            }`}
          >
            Reviews (8)
          </button>
        </div>

        <div className="p-8">
          {activeTab === "description" ? (
            <div className="space-y-8">
              
              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">
                  Specifications
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-inner bg-slate-50/20">
                  <table className="w-full text-left border-collapse text-xs">
                    <tbody>
                      {[
                        { label: "Category", val: product.category?.name || "Root category" },
                        { label: "Manufacturer / Brand", val: product.brand || "Raman Green" },
                        { label: "Cultivation Standard", val: product.cultivation || "Organic Lab" },
                        { label: "Registered Cities", val: product.cultivation_city?.map((c: any) => c.name || c).join(", ") || "All cities" },
                        { label: "Certificates", val: product.certificates?.map((c: any) => c.name || c).join(", ") || "Certified organic" }
                      ].map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                          <td className="px-5 py-3.5 font-semibold text-slate-400 border-r border-slate-100 w-1/3">
                            {row.label}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-700">
                            {row.val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product details */}
              <div className="space-y-3.5">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">
                  Product details
                </h3>
                <ul className="list-disc list-inside space-y-2.5 text-xs text-slate-500 leading-relaxed font-semibold">
                  <li>Organic standard cultivation with zero synthetic pesticides or chemicals.</li>
                  <li>Harvested on-demand, packing full nutrient preservation.</li>
                  <li>Contains high density vitamins (A, C, K) and active antioxidant compounds.</li>
                  <li>Eco-friendly biological paper or compostable punnet packaging.</li>
                  <li>Store cool between 2°C - 5°C to preserve crunchy texture and fresh leaves.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { name: "Aarav Sharma", date: "June 2, 2026", text: "Extremely fresh microgreens! The packaging was secure and standard. Will order again.", stars: 5 },
                { name: "Priya Patel", date: "May 28, 2026", text: "Good size options, very clean leaves. Tastes perfect with salads. Highly recommend organic variants.", stars: 4 },
                { name: "John Doe", date: "May 15, 2026", text: "Healthy, fresh, and on-time delivery. The batch expiry date details on variants are helpful.", stars: 5 }
              ].map((rev, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{rev.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon
                          key={i}
                          icon="material-symbols:star"
                          className={`w-4 h-4 ${i < rev.stars ? "text-amber-400" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ProductViewPage;
