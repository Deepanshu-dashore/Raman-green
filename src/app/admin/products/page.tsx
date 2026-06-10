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
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
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
    </div>
  );
};

export default AdminProducts;
