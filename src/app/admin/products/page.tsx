"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/shared/DataTable';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/shared/Button';
import DeleteModal from '@/components/shared/DeleteModal';

const AdminProducts = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleTogglePublishClick = (product: any) => {
    setSelectedProduct(product);
    setPublishModalOpen(true);
  };

  const handleTogglePublishConfirm = () => {
    if (!selectedProduct) return;
    const p = selectedProduct;
    const newStatus = !p.isPublished;
    setPublishModalOpen(false);
    
    toast.promise(
      fetch(`/api/products/${p._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublished: newStatus })
      })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setProducts(prev => prev.map(item => item._id === p._id ? { ...item, isPublished: newStatus } : item));
            setSelectedProduct(null);
          } else {
            throw new Error(json.message);
          }
        }),
      {
        loading: newStatus ? 'Publishing product...' : 'Hiding product...',
        success: newStatus ? 'Product is now visible' : 'Product is now hidden',
        error: (err) => err.message || 'Failed to update visibility'
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedProduct) return;
    const p = selectedProduct;
    setDeleteModalOpen(false);
    toast.promise(
      fetch(`/api/products/softDelete/${p._id}`, { method: 'PUT' })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setProducts(prev => prev.filter(item => item._id !== p._id));
          } else {
            throw new Error(json.message);
          }
        }),
      {
        loading: 'Moving to trash...',
        success: 'Product moved to trash',
        error: (err) => err.message || 'Failed to move to trash'
      }
    );
  };

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setProducts(json.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load products.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Products"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products' }
        ]}
        actionNode={
          <Button
            onClick={() => router.push('/admin/products/add')}
            icon="lucide:plus"
          >
            Add Product
          </Button>
        }
      />

      {/* Product Table */}
      <DataTable
        data={products}
        loading={loading}
        rowKey={(p) => p._id}
        columns={[
          {
            key: 'name',
            label: 'Product Name',
            type: 'user',
            sortable: true,
            getAvatar: (p) => p.variants?.[0]?.images?.[0] || p.name?.charAt(0) || '?',
            getTitle: (p) => p.name,
            getSubtitle: (p) => `slug: ${p.slug}`,
          },
          {
            key: 'category',
            label: 'Category',
            sortable: true,
            custom: true,
            render: (p) => (
              <span className="text-sm text-gray-600">{p.category?.name || '-'}</span>
            )
          },
          {
            key: 'variantCount',
            label: 'Variants',
            sortable: false,
            custom: true,
            render: (p) => (
              <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-sm">
                {p.variants?.length || 0} {p.variants?.length === 1 ? 'Variant' : 'Variants'}
              </span>
            )
          },
          {
            key: 'basePrice',
            label: 'Price',
            sortable: true,
            custom: true,
            render: (p) => {
              // Compute price range from variant prices
              const prices = p.variants?.map((v: any) => v.basePrice).filter((pr: any) => pr != null) || [];
              const priceDisplay = (() => {
                if (prices.length === 0) return 'N/A';
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
              })();
              return (
                <div className="text-xs font-medium text-gray-600">{priceDisplay}</div>
              );
            }
          },
          {
            key: 'status',
            label: 'Status',
            custom: true,
            render: (p) => (
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${p.isFeatured ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                {p.isFeatured ? 'Featured' : 'Active'}
              </span>
            )
          },
          {
            key: 'isPublished',
            label: 'Published',
            custom: true,
            render: (p) => (
              <div className="flex items-center">
                <button
                  onClick={() => handleTogglePublishClick(p)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${p.isPublished ? 'bg-green-600' : 'bg-gray-200'}`}
                  aria-label="Toggle publish status"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${p.isPublished ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            )
          }
        ]}
        onView={(p) => router.push(`/admin/products/${p._id}`)}
        onEdit={(p) => router.push(`/admin/products/edit/${p._id}`)}
        onDelete={handleDeleteClick}
        additionalActions={[
          {
            label: "Manage Variants",
            icon: "solar:clipboard-list-bold-duotone",
            onClick: (p) => router.push(`/admin/products/edit/${p._id}/variants`)
          }
        ]}
        hiddenActions={[]}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Move to Trash"
        message={`Are you sure you want to move "${selectedProduct?.name}" to the trash? You can restore it later.`}
        confirmButtonText="Move to Trash"
      />

      {/* Publish/Hide Confirmation Modal */}
      {publishModalOpen && (
        <div
          className="w-full mx-auto fixed inset-0 bg-black/20 z-[9999] backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200"
          role="presentation"
        >
          <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedProduct?.isPublished ? "Hide Product" : "Publish Product"}
            </h2>
            <p className="text-sm text-gray-700 mt-2">
              Are you sure you want to {selectedProduct?.isPublished ? "hide" : "publish"} "{selectedProduct?.name}"? 
              {selectedProduct?.isPublished 
                ? " This will make the product invisible to customers on the landing page."
                : " This will make the product visible to customers on the landing page."}
            </p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setPublishModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="px-4 cursor-pointer py-2 border border-gray-300 rounded-md text-gray-800 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 cursor-pointer text-white font-semibold rounded-lg shadow transition ${
                  selectedProduct?.isPublished 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={handleTogglePublishConfirm}
              >
                {selectedProduct?.isPublished ? "Hide" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
