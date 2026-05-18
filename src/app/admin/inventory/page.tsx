"use client";

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/shared/Button';

interface InventoryItem {
  _id: string;
  variantId: {
    _id: string;
    sku: string;
    weight: number;
    size: number;
    value: number;
    basePrice: number;
    images?: string[];
    unit?: {
      _id: string;
      name: string;
      shortName: string;
    };
  };
  productId: {
    _id: string;
    name: string;
    brand: string;
  };
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  availableQty: number;
  reservedQty: number;
  notes: string;
}

const AdminInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({
    availableQty: 0,
    batchNumber: '',
    mfgDate: '',
    expiryDate: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/admin/inventory')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setItems(json.data);
          setFilteredItems(json.data);
        } else {
          toast.error(json.message || "Failed to load inventory");
        }
      })
      .catch(() => {
        toast.error("Network error while loading inventory");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Simple client-side search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = items.filter(item => {
      const productName = item.productId?.name?.toLowerCase() || '';
      const sku = item.variantId?.sku?.toLowerCase() || '';
      const batch = item.batchNumber?.toLowerCase() || '';
      return productName.includes(q) || sku.includes(q) || batch.includes(q);
    });
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    
    // Format dates to YYYY-MM-DD for standard date input fields
    const formattedMfg = item.mfgDate ? new Date(item.mfgDate).toISOString().split('T')[0] : '';
    const formattedExp = item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '';

    setEditForm({
      availableQty: item.availableQty || 0,
      batchNumber: item.batchNumber || '',
      mfgDate: formattedMfg,
      expiryDate: formattedExp,
      notes: item.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    const toastId = toast.loading("Updating inventory and synchronizing stock levels...");

    try {
      const res = await fetch(`/api/admin/inventory/${selectedItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableQty: Number(editForm.availableQty),
          batchNumber: editForm.batchNumber,
          mfgDate: editForm.mfgDate ? new Date(editForm.mfgDate) : undefined,
          expiryDate: editForm.expiryDate ? new Date(editForm.expiryDate) : undefined,
          notes: editForm.notes
        })
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Inventory updated and synchronized successfully!", { id: toastId });
        setIsEditOpen(false);
        // Refresh local list
        fetchInventory();
      } else {
        throw new Error(json.message || "Failed to update inventory");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const getStockBadge = (qty: number) => {
    if (qty === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-red-50 text-red-600 border border-red-100">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
          Out of Stock
        </span>
      );
    }
    if (qty < 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-amber-50 text-amber-600 border border-amber-100">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          Low Stock ({qty})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-green-50 text-green-600 border border-green-100">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
        Healthy ({qty})
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Warehouse Inventory"
        description="Monitor catalog batch numbers, check manufacturing/expiry alerts, and sync variant quantities."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Inventory' }
        ]}
      />

      {/* Control and Search panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icon icon="lucide:search" className="w-5 h-5" />
          </span>
          <input 
            type="text" 
            placeholder="Search by Product Name, SKU, or Batch Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm font-semibold"
          />
        </div>
        
        <Button 
          variant="outline"
          onClick={fetchInventory}
          icon="lucide:refresh-cw"
          className="border-gray-200 hover:bg-gray-50 font-bold"
        >
          Refresh Stock
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <DataTable 
          data={filteredItems}
          loading={loading}
          rowKey={(item) => item._id}
          columns={[
            {
              key: 'product',
              label: 'Product & Variant',
              custom: true,
              render: (item) => (
                <div className="flex items-center gap-3">
                  {/* Small visual image fallback */}
                  <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {item.variantId?.images?.[0] ? (
                      <img src={item.variantId.images[0]} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="lucide:box" className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-800 leading-snug">
                      {item.productId?.name || 'Unknown Product'}
                    </div>
                    <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                      Brand: {item.productId?.brand || 'Raman Green'} • Pack: {item.variantId?.weight || item.variantId?.value || ''} {item.variantId?.unit?.shortName || ''}
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'sku',
              label: 'Variant SKU',
              custom: true,
              render: (item) => (
                <span className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl">
                  {item.variantId?.sku || 'N/A'}
                </span>
              )
            },
            {
              key: 'batchNumber',
              label: 'Batch Ref',
              custom: true,
              render: (item) => (
                <div className="text-xs font-semibold text-gray-700">
                  {item.batchNumber}
                </div>
              )
            },
            {
              key: 'dates',
              label: 'Mfg / Expiry Dates',
              custom: true,
              render: (item) => {
                const mfg = item.mfgDate ? new Date(item.mfgDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A';
                const exp = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A';
                
                // Expiry Check
                const isExpired = item.expiryDate && new Date(item.expiryDate).getTime() < Date.now();

                return (
                  <div>
                    <div className="text-[11px] text-gray-500">Mfg: <span className="font-semibold text-gray-700">{mfg}</span></div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Exp: <span className={`font-semibold ${isExpired ? 'text-red-500 font-black' : 'text-gray-700'}`}>{exp}</span>
                    </div>
                  </div>
                );
              }
            },
            {
              key: 'status',
              label: 'Stock Status',
              custom: true,
              render: (item) => getStockBadge(item.availableQty)
            },
            {
              key: 'reserved',
              label: 'Reserved Qty',
              align: 'center',
              custom: true,
              render: (item) => (
                <span className="text-xs font-black text-gray-500">
                  {item.reservedQty || 0}
                </span>
              )
            },
            {
              key: 'actions',
              label: 'Action',
              align: 'right',
              custom: true,
              render: (item) => (
                <button 
                  onClick={() => handleEditClick(item)}
                  className="px-3.5 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5"
                >
                  <Icon icon="lucide:edit-2" className="w-3.5 h-3.5" />
                  Edit Stock
                </button>
              )
            }
          ]}
        />
      </div>

      {/* Custom High-End Edit Stock Modal */}
      {isEditOpen && selectedItem && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div 
            onClick={() => setIsEditOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-all"
          />

          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg p-8 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-800">Edit Warehouse Stock</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Product: {selectedItem.productId?.name} • SKU: {selectedItem.variantId?.sku}
                </p>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Available Quantity</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={editForm.availableQty}
                    onChange={(e) => setEditForm({ ...editForm, availableQty: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold"
                    placeholder="Enter stock quantity"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Batch Number</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.batchNumber}
                    onChange={(e) => setEditForm({ ...editForm, batchNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold"
                    placeholder="e.g. BATCH-01"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mfg Date</label>
                  <input 
                    type="date" 
                    required
                    value={editForm.mfgDate}
                    onChange={(e) => setEditForm({ ...editForm, mfgDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    value={editForm.expiryDate}
                    onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Inventory Notes</label>
                  <textarea 
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold min-h-[80px]"
                    placeholder="Batch shipment notes, quality review, etc."
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="!rounded-2xl px-6 font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="edit" 
                  isLoading={saving}
                  icon="lucide:save"
                  className="!rounded-2xl px-8 shadow-lg font-bold"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
