"use client";

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import DeleteModal from '@/components/shared/DeleteModal';

export default function ProductsTrashPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const fetchTrashProducts = () => {
    setLoading(true);
    fetch('/api/products/trash')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setProducts(json.data);
        } else {
          toast.error(json.message || "Failed to load trash products.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Error fetching products from trash.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrashProducts();
  }, []);

  const handleRestoreClick = (product: any) => {
    toast.promise(
      fetch(`/api/products/restore/${product._id}`, { method: 'PUT' })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setProducts(prev => prev.filter(item => item._id !== product._id));
            return json;
          } else {
            throw new Error(json.message);
          }
        }),
      {
        loading: 'Restoring product...',
        success: 'Product restored successfully',
        error: (err) => err.message || 'Failed to restore product'
      }
    );
  };

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedProduct) return;
    const p = selectedProduct;
    setDeleteModalOpen(false);
    toast.promise(
      fetch(`/api/products/${p._id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setProducts(prev => prev.filter(item => item._id !== p._id));
          } else {
            throw new Error(json.message);
          }
        }),
      {
        loading: 'Permanently deleting...',
        success: 'Product deleted permanently',
        error: (err) => err.message || 'Failed to delete product'
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Products Trash"
        description="Permanently delete or restore soft-deleted products and their variants."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Trash', href: '/admin/trash/products' },
          { label: 'Products' }
        ]}
      />

      {/* Table */}
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
            key: 'deletedAt',
            label: 'Deleted At',
            type: 'date',
            sortable: true,
            getDate: (p) => p.deletedAt || new Date()
          }
        ]}
        hiddenActions={['view', 'edit']}
        onDelete={handleDeleteClick}
        additionalActions={[
          {
            label: 'Restore',
            icon: 'solar:square-arrow-left-bold-duotone',
            onClick: handleRestoreClick
          }
        ]}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product Permanently"
        message={`Are you sure you want to permanently delete "${selectedProduct?.name}"? This will delete all associated variants and cannot be undone.`}
        confirmButtonText="Delete Permanently"
      />
    </div>
  );
}
