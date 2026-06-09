"use client";

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { DataTable } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import DeleteModal from '@/components/shared/DeleteModal';

export default function ProductsTrashPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [inventoryWarningOpen, setInventoryWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

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

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    const p = selectedProduct;
    setDeleteModalOpen(false);

    const loadingToast = toast.loading('Permanently deleting...');
    try {
      const res = await fetch(`/api/products/${p._id}`, { method: 'DELETE' });
      const json = await res.json();

      toast.dismiss(loadingToast);

      if (json.success) {
        toast.success('Product deleted permanently');
        setProducts(prev => prev.filter(item => item._id !== p._id));
        setSelectedProduct(null);
      } else {
        if (json.data?.hasInventory) {
          setWarningMessage(json.message || "Cannot delete product as it has associated inventory records.");
          setInventoryWarningOpen(true);
        } else {
          toast.error(json.message || 'Failed to delete product');
        }
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to delete product');
    }
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

      {/* Inventory Warning Modal */}
      {inventoryWarningOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop blur overlay */}
          <div
            onClick={() => setInventoryWarningOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-all"
          />

          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-100">
                <Icon icon="solar:shield-warning-bold-duotone" className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-gray-800">Inventory Records Exist</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {warningMessage}
                <br />
                <span className="font-semibold text-gray-600 block mt-2 text-xs">
                  Please delete all stock/inventory entries associated with this product's variants first.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                <button
                  onClick={() => {
                    setInventoryWarningOpen(false);
                    router.push('/admin/inventory');
                  }}
                  className="flex-1 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/10 hover:shadow-lg transition-all"
                >
                  Manage Inventory
                </button>
                <button
                  onClick={() => setInventoryWarningOpen(false)}
                  className="flex-1 px-5 py-3 border border-gray-200 hover:bg-gray-50 text-gray-50 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
