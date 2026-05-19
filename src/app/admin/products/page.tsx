"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
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
      fetch(`/api/products/${p._id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(json => {
           if(json.success) {
             setProducts(prev => prev.filter(item => item._id !== p._id));
           } else {
             throw new Error(json.message);
           }
        }),
      {
        loading: 'Deleting...',
        success: 'Product deleted',
        error: (err) => err.message || 'Failed to delete'
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
            key: 'image',
            label: 'Image',
            align: 'center',
            custom: true,
            render: (p) => {
              const firstImg = p.variants?.[0]?.images?.[0] || null;
              return (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden mx-auto">
                  {firstImg ? (
                    <img src={firstImg} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon icon="lucide:image" className="w-6 h-6 text-gray-300" />
                  )}
                </div>
              );
            }
          },
          {
            key: 'name',
            label: 'Product Name',
            sortable: true,
            custom: true,
            render: (p) => (
              <div>
                <div className="text-sm font-bold capitalize">{p.name}</div>
                <div className="text-xs text-gray-400">slug: {p.slug}</div>
              </div>
            )
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
            key: 'basePrice',
            label: 'Price',
            sortable: true,
            custom: true,
            render: (p) => (
              <div className="text-sm font-bold text-gray-900">₹{p.basePrice}</div>
            )
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
        hiddenActions={[]}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default AdminProducts;
