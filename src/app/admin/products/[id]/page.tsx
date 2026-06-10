"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { DataTable } from "@/components/shared/DataTable";
import DeleteModal from "@/components/shared/DeleteModal";

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

  // Variant interactions state
  const [selectedViewVariant, setSelectedViewVariant] = useState<any | null>(null);
  const [selectedDeleteVariant, setSelectedDeleteVariant] = useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setProduct(json.data);
          const firstVariant = json.data?.variants?.[0] || null;
          const firstImg = firstVariant?.images?.[0] || json.data?.variants?.flatMap((v: any) => v.images || [])?.[0] || null;
          setActiveImage(firstImg);
          setActiveImageIndex(0);
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
    const imgs = product.variants?.flatMap((v: any) => v.images || []) || [];
    return Array.from(new Set(imgs));
  }, [product]);

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

  const confirmDeleteVariant = () => {
    if (!selectedDeleteVariant) return;
    const variantId = selectedDeleteVariant._id;
    setDeleteModalOpen(false);

    toast.promise(
      fetch(`/api/products/variants/${variantId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setProduct((prev: any) => {
              if (!prev) return null;
              return {
                ...prev,
                variants: prev.variants.filter((v: any) => v._id !== variantId)
              };
            });
            setSelectedDeleteVariant(null);
          } else {
            throw new Error(json.message || 'Failed to delete variant');
          }
        }),
      {
        loading: 'Deleting variant...',
        success: 'Variant deleted successfully',
        error: (err) => err.message || 'Failed to delete variant'
      }
    );
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600" />
        <p className="text-sm font-semibold text-slate-500">Loading product Profile...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 shadow-inner">
          <Icon icon="lucide:alert-circle" className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Product profile not found</h2>
        <p className="text-sm text-slate-500">
          This product may have been permanently removed or the ID is invalid.
        </p>
        <button
          onClick={() => router.push("/admin/products")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-md text-xs"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Back to products list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-4">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/admin/products")}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 font-bold text-xs transition-colors group mb-1.5"
          >
            <Icon icon="lucide:chevron-left" className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Products list
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">{product.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              product.isPublished 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {product.isPublished ? 'Published' : 'Draft'}
            </span>
            {product.isFeatured && (
              <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `/products/${product.slug}`);
              toast.success("Public link copied to clipboard!");
            }}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all border border-slate-200/60 shadow-sm"
            title="Copy Public Link"
          >
            <Icon icon="lucide:share-2" className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => router.push(`/admin/products/edit/${productId}`)}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200/60 shadow-sm text-xs font-bold"
          >
            <Icon icon="lucide:edit-2" className="w-4 h-4" />
            Edit Profile
          </button>
          
          <button
            onClick={() => router.push(`/admin/products/edit/${productId}/variants`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-md text-xs font-bold"
          >
            <Icon icon="solar:clipboard-list-bold-duotone" className="w-4.5 h-4.5" />
            Manage Variants
          </button>
        </div>
      </div>

      {/* Main product Profile dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Media Gallery & Logistics Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-sm group">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <Icon icon="lucide:image" className="w-16 h-16 mb-2" />
                <span className="text-xs font-semibold text-slate-400">No variant images</span>
              </div>
            )}

            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-950 shadow-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-950 shadow-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wider">
                  {activeImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails grid */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-1 hide-scrollbar">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveImage(imgUrl);
                    setActiveImageIndex(idx);
                  }}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === imgUrl
                      ? "border-green-600 scale-[0.96] shadow-sm"
                      : "border-slate-200/80 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Logistics & Registration metadata */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Logistics & Compliance</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 font-semibold">Brand Label</span>
                <span className="font-bold text-slate-700">{product.brand || "Raman Green"}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 font-semibold">Cultivation Standard</span>
                <span className="font-bold text-slate-700">{product.cultivation || "Organic Labs"}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 font-semibold">Registered Cities</span>
                <span className="font-bold text-slate-700 truncate max-w-[200px]" title={product.cultivation_city?.map((c: any) => c.name || c).join(", ")}>
                  {product.cultivation_city?.map((c: any) => c.name || c).join(", ") || "All Cities"}
                </span>
              </div>
            </div>

            {/* Certificates */}
            {product.certificates && product.certificates.length > 0 && (
              <div className="pt-2.5 border-t border-slate-100 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Certificates</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {product.certificates.map((cert: any, idx: number) => {
                    const name = typeof cert === 'object' ? cert.name : cert;
                    const img = typeof cert === 'object' ? cert.url : null;
                    return (
                      <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-600">
                        {img && <img src={img} className="w-4 h-4 object-contain" alt="" />}
                        <span>{name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Base Metadata & Dynamic Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Base Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Category Path</span>
                <span className="block font-bold text-slate-800 text-sm">
                  {product.subCategory 
                    ? `${product.category?.name || "Category"} › ${product.subCategory?.name || (typeof product.subCategory === 'string' ? product.subCategory : "Subcategory")}` 
                    : product.category?.name || "Root Category"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Slug URL Identifier</span>
                <span className="block font-bold text-slate-800 font-mono text-xs select-all">/{product.slug}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Season / Seasonality</span>
                <span className="block font-bold text-slate-800">{product.cultivationOrSeason || "All Seasons"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Inventory Valuation Range</span>
                <span className="block font-bold text-slate-800">{stats.priceLabel}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-semibold">Product Description</span>
              <p className="text-slate-600 leading-relaxed font-medium">
                {product.description || "No description provided for this base product."}
              </p>
            </div>

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold">Ingredients</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.ingredients.map((ing: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-green-50 border border-green-100/40 text-green-700 rounded-lg font-bold"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Declaration */}
            {product.declaration && (
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold">Declarations / Features</span>
                <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-600 font-medium leading-relaxed">
                  <Icon icon="solar:info-square-bold-duotone" className="w-4.5 h-4.5 text-green-600 shrink-0 mt-0.5" />
                  <div>{product.declaration}</div>
                </div>
              </div>
            )}
          </div>

          {/* Specifications Card */}
          {product.spaceification && product.spaceification.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100">Technical Specifications</h3>
              
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody>
                    {product.spaceification.map((spec: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/25"}>
                        <td className="px-5 py-3 font-semibold text-slate-400 border-r border-slate-100 w-1/3">
                          {spec.title}
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-700">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Variants Section with DataTable */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Active Stock Variants</h3>
            <p className="text-[11px] text-slate-400 font-medium">Warehouse inventory levels, packaging configurations, and variant prices</p>
          </div>
          <span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
            {product.variants?.length || 0} Total Variants
          </span>
        </div>

        {(!product.variants || product.variants.length === 0) ? (
          <div className="text-center py-10 space-y-2 border-2 border-dashed border-slate-100 rounded-xl">
            <Icon icon="solar:box-broken" className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-400">No active variants configured</p>
            <button
              onClick={() => router.push(`/admin/products/edit/${productId}/variants`)}
              className="text-xs text-green-600 hover:underline font-bold"
            >
              Add variant configurations now
            </button>
          </div>
        ) : (
          <div className="w-full">
            <DataTable
              data={product.variants}
              loading={false}
              showSearch={false}
              showPagination={false}
              rowKey={(v) => v._id}
              columns={[
                {
                  key: "sku",
                  label: "SKU Code",
                  type: "user",
                  getAvatar: (v: any) => v.images?.[0] || v.sku?.charAt(0) || "?",
                  getTitle: (v) => v.sku,
                  getSubtitle: (v) => {
                    const sizeLabel = [v.weight || v.size, v.unit?.shortName || v.unit?.name]
                      .filter(Boolean)
                      .join(" ");
                    return sizeLabel || "Standard Size";
                  }
                },
                {
                  key: "basePrice",
                  label: "Price per Unit",
                  custom: true,
                  render: (v) => {
                    const hasDiscount = v.discountedPrice && v.discountedPrice < v.basePrice;
                    return (
                      <div className="text-xs">
                        {hasDiscount ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">₹{v.basePrice}</span>
                            <span className="text-[10.5px] text-slate-400 line-through">₹{v.discountedPrice}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-900">₹{v.basePrice}</span>
                        )}
                      </div>
                    );
                  }
                },
                {
                  key: "packaging",
                  label: "Packaging Configuration",
                  custom: true,
                  render: (v) => (
                    <span className="text-xs text-slate-600 font-semibold">
                      {v.packaging && v.packaging.length > 0
                        ? v.packaging.map((p: any) => p.name || p).join(", ")
                        : "Standard Pack"}
                    </span>
                  )
                },
                {
                  key: "stock",
                  label: "Available Stock Status",
                  custom: true,
                  align: "right",
                  render: (v) => {
                    const stockLevel = Number(v.stock) || 0;
                    return (
                      <div className="flex justify-end">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          stockLevel <= 0 
                            ? "bg-rose-50 text-rose-600 border border-rose-100" 
                            : stockLevel < 15 
                              ? "bg-amber-50 text-amber-600 border border-amber-100" 
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            stockLevel <= 0 ? "bg-rose-500" : stockLevel < 15 ? "bg-amber-500" : "bg-emerald-500"
                          }`} />
                          {stockLevel <= 0 ? "Out of Stock" : `${stockLevel} Units`}
                        </span>
                      </div>
                    );
                  }
                }
              ]}
              onView={(v) => setSelectedViewVariant(v)}
              onEdit={(v) => router.push(`/admin/products/edit/${productId}/variants?variantId=${v._id}`)}
              onDelete={(v) => {
                setSelectedDeleteVariant(v);
                setDeleteModalOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Variant View Modal */}
      {selectedViewVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200/60 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variant Profile</span>
                <h3 className="text-base font-black text-slate-800">SKU: {selectedViewVariant.sku}</h3>
              </div>
              <button
                onClick={() => setSelectedViewVariant(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Images */}
              <div className="space-y-3">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200/60">
                  {selectedViewVariant.images?.[0] ? (
                    <img
                      src={selectedViewVariant.images[0]}
                      alt={selectedViewVariant.sku}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <Icon icon="lucide:image" className="w-12 h-12 mb-1" />
                      <span className="text-[10px] font-semibold text-slate-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Additional Images list */}
                {selectedViewVariant.images && selectedViewVariant.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-1 hide-scrollbar">
                    {selectedViewVariant.images.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Status</span>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      (Number(selectedViewVariant.stock) || 0) <= 0 
                        ? "bg-rose-50 text-rose-600 border border-rose-100" 
                        : (Number(selectedViewVariant.stock) || 0) < 15 
                          ? "bg-amber-50 text-amber-600 border border-amber-100" 
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        (Number(selectedViewVariant.stock) || 0) <= 0 ? "bg-rose-500" : (Number(selectedViewVariant.stock) || 0) < 15 ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      {selectedViewVariant.stock || 0} Units Available
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Pricing</span>
                  <div className="text-sm font-bold text-slate-800">
                    ₹{selectedViewVariant.basePrice}
                    {selectedViewVariant.discountedPrice && (
                      <span className="text-xs text-slate-400 line-through ml-2">
                        ₹{selectedViewVariant.discountedPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size / Dimensions</span>
                  <div className="text-xs font-semibold text-slate-700">
                    {[selectedViewVariant.weight || selectedViewVariant.size, selectedViewVariant.unit?.name || selectedViewVariant.unit].filter(Boolean).join(" ") || "—"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Packaging Options</span>
                  <div className="text-xs font-semibold text-slate-700">
                    {selectedViewVariant.packaging && selectedViewVariant.packaging.length > 0
                      ? selectedViewVariant.packaging.map((p: any) => p.name || p).join(", ")
                      : "Standard Box Pack"}
                  </div>
                </div>

                {/* Usage Instructions */}
                {selectedViewVariant.usageInstructions && selectedViewVariant.usageInstructions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usage Instructions</span>
                    <ul className="list-disc list-inside text-xs text-slate-500 leading-relaxed font-semibold">
                      {selectedViewVariant.usageInstructions.map((ins: string, idx: number) => (
                        <li key={idx}>{ins}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedViewVariant(null)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 text-xs font-bold transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedViewVariant(null);
                  router.push(`/admin/products/edit/${productId}/variants?variantId=${selectedViewVariant._id}`);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Icon icon="lucide:edit-2" className="w-3.5 h-3.5" />
                Edit Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedDeleteVariant(null);
        }}
        onConfirm={confirmDeleteVariant}
        title="Delete Variant"
        message={`Are you sure you want to permanently delete the variant "${selectedDeleteVariant?.sku || ''}"? This action will wipe all warehouse inventory batches and cannot be undone.`}
        confirmButtonText="Delete Variant"
      />
    </div>
  );
};

export default ProductViewPage;
