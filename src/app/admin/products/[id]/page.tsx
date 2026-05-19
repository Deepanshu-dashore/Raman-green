"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import Card from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

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

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setProduct(json.data);
          // Set initial active image to the first variant's first image, if any
          const firstImg = json.data?.variants?.[0]?.images?.[0] || null;
          setActiveImage(firstImg);
        } else {
          toast.error(json.message || "Failed to load product details.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("An error occurred while fetching product details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
        <p className="text-sm font-bold text-gray-500">Loading product view...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-2">
          <Icon icon="lucide:alert-circle" className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-800">Product Not Found</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The product you are looking for might have been deleted or the ID is invalid.
        </p>
        <Button onClick={() => router.push('/admin/products')} icon="lucide:arrow-left" className="!rounded-2xl">
          Back to Products
        </Button>
      </div>
    );
  }

  // Gather all unique images from variants
  const allImages: string[] = Array.from(
    new Set(product.variants?.flatMap((v: any) => v.images || []) || [])
  );

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 animate-in fade-in duration-500 space-y-8">
      {/* Header */}
      <PageHeader
        title={product.name}
        description={`Manage details and view configurations for ${product.name}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: product.name }
        ]}
        backLink="/admin/products"
        actionNode={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/products/edit/${productId}/variants`)}
              icon="lucide:layers"
              className="!rounded-2xl !py-2 !px-4 text-xs font-bold"
            >
              Configure Variants
            </Button>
            <Button
              onClick={() => router.push(`/admin/products/edit/${productId}`)}
              icon="lucide:edit"
              className="!rounded-2xl !py-2 !px-4 text-xs font-bold"
            >
              Edit Product
            </Button>
          </div>
        }
      />

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery Section */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="!p-4 border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
            {activeImage ? (
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-full h-80 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-gray-300">
                <Icon icon="lucide:image" className="w-16 h-16 mb-2" />
                <span className="text-xs font-bold text-gray-400">No images available</span>
              </div>
            )}

            {/* Carousel Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-2 w-full mt-4 hide-scrollbar">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === imgUrl ? 'border-green-600 scale-95 shadow-sm' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Metadata Section */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="!p-8 border-gray-100 shadow-sm space-y-6 h-full flex flex-col justify-between">
            <div className="space-y-6">
              {/* Product Info */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase text-green-700 bg-green-50 border border-green-100/50 px-2 py-0.5 rounded-lg">
                    {product.brand || 'Raman Green'}
                  </span>
                  <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-lg">
                    {product.category?.name || 'Uncategorized'}
                  </span>
                  {product.isFeatured && (
                    <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 border border-purple-100/50 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                      <Icon icon="lucide:star" className="w-3 h-3 fill-current" />
                      Featured
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-gray-800 capitalize">{product.name}</h2>
                <p className="text-xs text-gray-400 mt-1 font-mono">ID: {product._id} • Slug: {product.slug}</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Product Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'No description provided for this product.'}
                </p>
              </div>
            </div>

            {/* Certificates */}
            {product.certificates && product.certificates.length > 0 && (
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Certificates & Quality</h4>
                <div className="flex flex-wrap gap-3">
                  {product.certificates.map((cert: any) => (
                    <div
                      key={cert._id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      {cert.url && (
                        <img src={cert.url} alt={cert.name} className="w-5 h-5 object-contain" />
                      )}
                      <span className="text-xs font-bold text-gray-700">{cert.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Variant Table Section */}
      <Card className="!p-8 border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-gray-800">Product Variants</h3>
            <p className="text-xs text-gray-400 mt-0.5">Configure and monitor individual packages, sizes, and stock limits.</p>
          </div>
          <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-black">
            {product.variants?.length || 0} Configured
          </span>
        </div>

        {/* Custom Variant Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-y border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Size/Weight</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Discounted Price</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Packaging</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((v: any) => {
                  const stockStatus = v.stock === 0 
                    ? { text: "Out of Stock", color: "bg-red-50 text-red-700 border-red-100" }
                    : v.stock < 15
                      ? { text: `Low Stock (${v.stock})`, color: "bg-amber-50 text-amber-700 border-amber-100" }
                      : { text: `In Stock (${v.stock})`, color: "bg-green-50 text-green-700 border-green-100" };

                  return (
                    <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Image */}
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                          {v.images?.[0] ? (
                            <img src={v.images[0]} alt="Variant" className="w-full h-full object-cover" />
                          ) : (
                            <Icon icon="lucide:image" className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gray-700 uppercase bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                          {v.sku}
                        </span>
                      </td>

                      {/* Size / Weight */}
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {v.weight || v.value || ''} {v.unit?.shortName || v.unit?.name || ''}
                      </td>

                      {/* Base Price */}
                      <td className="px-6 py-4 font-black text-gray-900">
                        ₹{v.basePrice}
                      </td>

                      {/* Discounted Price */}
                      <td className="px-6 py-4">
                        {v.discountedPrice ? (
                          <span className="font-bold text-green-600">₹{v.discountedPrice}</span>
                        ) : (
                          <span className="text-gray-400 font-medium text-xs">No discount</span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>

                      {/* Packaging */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {v.packaging && v.packaging.length > 0 ? (
                            v.packaging.map((pack: any) => (
                              <span
                                key={pack._id}
                                className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-md"
                              >
                                {pack.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">-</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => router.push(`/admin/products/edit/${productId}/variants`)}
                          className="p-2 hover:bg-green-50 text-green-600 rounded-xl transition-colors inline-flex items-center gap-1 text-xs font-black border border-transparent hover:border-green-100"
                        >
                          <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-semibold bg-gray-50/50 rounded-xl">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Icon icon="lucide:alert-circle" className="w-6 h-6 text-gray-300" />
                      <p>No variants configured for this base product yet.</p>
                      <button
                        onClick={() => router.push(`/admin/products/edit/${productId}/variants`)}
                        className="text-xs font-black text-green-600 hover:text-green-700 underline"
                      >
                        Click here to add your first variant
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProductViewPage;
