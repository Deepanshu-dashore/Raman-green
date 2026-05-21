"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { PencilIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { DataTable } from "@/components/shared/DataTable";
import { getStatusStyle } from "@/constants/status";

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
      .finally(() => setLoading(false));
  }, [productId]);

  const allImages: string[] = useMemo(
    () =>
      Array.from(
        new Set(product?.variants?.flatMap((v: any) => v.images || []) || [])
      ),
    [product]
  );

  const stats = useMemo(() => {
    const variants = product?.variants || [];
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
      variantCount: variants.length,
      priceLabel,
      totalStock,
      isFeatured: !!product?.isFeatured,
    };
  }, [product]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600" />
        <p className="text-sm font-medium text-gray-500">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
          <Icon icon="lucide:alert-circle" className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Product not found</h2>
        <p className="text-sm text-gray-500">
          This product may have been removed or the link is invalid.
        </p>
        <Button onClick={() => router.push("/admin/products")} icon="lucide:arrow-left">
          Back to products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={product.name}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: product.name },
        ]}
        backLink="/admin/products"
        actionNode={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/products/edit/${productId}/variants`)}
              icon="lucide:layers"
            >
              Variants
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/admin/products/edit/${productId}`)}
              icon="lucide:edit"
            >
              Edit product
            </Button>
          </div>
        }
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Variants",
            value: String(stats.variantCount),
            icon: "lucide:layers",
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Price range",
            value: stats.priceLabel,
            icon: "lucide:indian-rupee",
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Total stock",
            value: String(stats.totalStock),
            icon: "lucide:package",
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Status",
            value: stats.isFeatured ? "Featured" : "Active",
            icon: stats.isFeatured ? "lucide:star" : "lucide:check-circle",
            color: stats.isFeatured
              ? "text-purple-600 bg-purple-50"
              : "text-green-600 bg-green-50",
          },
        ].map((item) => (
          <Card key={item.label} className="!p-4 !min-h-0 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
            >
              <Icon icon={item.icon} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-sm font-bold text-gray-900 truncate">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Product overview */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Gallery */}
        <Card className="!p-4 !min-h-0 lg:sticky lg:top-24">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Gallery
          </p>
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                <Icon icon="lucide:image" className="w-12 h-12 mb-2" />
                <span className="text-xs font-medium text-gray-400">No images</span>
              </div>
            )}
          </div>
          {allImages.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === imgUrl
                      ? "border-green-600 ring-1 ring-green-600/30"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`View ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Details */}
        <Card className="!p-6 !min-h-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg">
              {product.brand || "Raman Green"}
            </span>
            <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
              {product.category?.name || "Uncategorized"}
            </span>
            {product.isFeatured && (
              <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                <Icon icon="lucide:star" className="w-3 h-3" />
                Featured
              </span>
            )}
            {product.isPublished === false && (
              <span className="text-[10px] font-bold uppercase text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                Draft
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Slug
              </p>
              <p className="font-mono text-gray-800 break-all">{product.slug}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Product ID
              </p>
              <p className="font-mono text-gray-500 text-xs break-all">{product._id}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description || "No description provided."}
            </p>
          </div>

          {product.certificates?.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Certificates
              </p>
              <div className="flex flex-wrap gap-2">
                {product.certificates.map((cert: any) => (
                  <div
                    key={cert._id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg"
                  >
                    {cert.url && (
                      <img
                        src={cert.url}
                        alt={cert.name}
                        className="w-5 h-5 object-contain"
                      />
                    )}
                    <span className="text-xs font-semibold text-gray-700">
                      {cert.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Variants</h2>
            <p className="text-sm text-gray-500">
              Sizes, pricing, stock, and packaging for this product.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/products/edit/${productId}/variants`)}
            icon="lucide:plus"
          >
            Manage variants
          </Button>
        </div>

        {product.variants?.length > 0 ? (
        <DataTable
          data={product.variants}
          loading={false}
          rowKey={(v: any) => v._id}
          columns={[
            {
              key: "image",
              label: "Variant",
              type: "user",
              getAvatar: (v: any) => v.images?.[0] || v.sku?.charAt(0) || "?",
              getTitle: (v: any) => v.sku,
              getSubtitle: (v: any) => {
                const size = [v.weight || v.value, v.unit?.shortName || v.unit?.name]
                  .filter(Boolean)
                  .join(" ");
                return size || "—";
              },
            },
            {
              key: "basePrice",
              label: "Price",
              custom: true,
              render: (v: any) => (
                <div className="text-sm">
                  <span className="font-bold text-gray-900">₹{v.basePrice}</span>
                  {v.discountedPrice ? (
                    <span className="block text-xs font-medium text-green-600">
                      ₹{v.discountedPrice} sale
                    </span>
                  ) : null}
                </div>
              ),
            },
            {
              key: "stock",
              label: "Stock",
              custom: true,
              render: (v: any) => {
                const stock = Number(v.stock) || 0;
                const key =
                  stock === 0
                    ? "outOfStock"
                    : stock < 15
                      ? "lowStock"
                      : "inStock";
                const style = getStatusStyle(key);
                return (
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${style.color}`}
                  >
                    {stock === 0
                      ? "Out of stock"
                      : stock < 15
                        ? `Low (${stock})`
                        : `In stock (${stock})`}
                  </span>
                );
              },
            },
            {
              key: "packaging",
              label: "Packaging",
              custom: true,
              render: (v: any) =>
                v.packaging?.length ? (
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {v.packaging.map((pack: any) => (
                      <span
                        key={pack._id}
                        className="text-[9px] font-bold uppercase text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded"
                      >
                        {pack.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                ),
            },
          ]}
          additionalActions={[
            {
              label: "Manage",
              icon: PencilIcon,
              onClick: () =>
                router.push(`/admin/products/edit/${productId}/variants`),
            },
          ]}
          hiddenActions={["view", "edit", "delete"]}
        />
        ) : (
          <Card className="!p-10 !min-h-0 text-center">
            <Icon icon="lucide:layers" className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500 mb-4">
              No variants configured yet.
            </p>
            <Button
              onClick={() =>
                router.push(`/admin/products/edit/${productId}/variants`)
              }
              icon="lucide:plus"
            >
              Add first variant
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductViewPage;
