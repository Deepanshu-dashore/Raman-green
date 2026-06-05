"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/components/shared/PageHeader';
import Card from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import LabledInput from '@/components/shared/LabledInput';

interface ProductOption {
  _id: string;
  name: string;
  brand: string;
  variants?: VariantOption[];
}

interface VariantOption {
  _id: string;
  sku: string;
  weight: number;
  size: number;
  basePrice: number;
  images?: string[];
  unit?: {
    _id: string;
    name: string;
    shortName: string;
  };
}

const AddStockPage = () => {
  const router = useRouter();

  // Data state
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [existingInventories, setExistingInventories] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    productId: '',
    variantId: '',
    batchNumber: '',
    mfgDate: '',
    expiryDate: '',
    availableQty: 0,
    reservedQty: 0,
    lowStockLimit: 10,
    notes: '',
    inventoryId: '' // Explicit selected inventory ID
  });

  // Fetch products and all inventories on mount
  useEffect(() => {
    setLoadingProducts(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setProducts(json.data || []);
        } else {
          toast.error(json.message || "Failed to load products");
        }
      })
      .catch(() => toast.error("Network error loading products"))
      .finally(() => setLoadingProducts(false));

    fetch('/api/inventory')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setExistingInventories(json.data || []);
        }
      })
      .catch(() => console.error("Error loading existing inventories"));
  }, []);

  // Fetch variants when product changes
  useEffect(() => {
    if (!form.productId) {
      setVariants([]);
      setForm(prev => ({ ...prev, variantId: '', inventoryId: '' }));
      return;
    }

    setLoadingVariants(true);
    fetch(`/api/products/${form.productId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const productData = json.data;
          setVariants(productData.variants || []);
        } else {
          setVariants([]);
          toast.error("Failed to load product variants");
        }
      })
      .catch(() => {
        setVariants([]);
        toast.error("Network error loading variants");
      })
      .finally(() => setLoadingVariants(false));
  }, [form.productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleInventoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invId = e.target.value;
    if (!invId) {
      setForm(prev => ({
        ...prev,
        inventoryId: '',
        variantId: '',
        batchNumber: '',
        mfgDate: '',
        expiryDate: '',
        availableQty: 0,
        reservedQty: 0,
        lowStockLimit: 10,
        notes: ''
      }));
      return;
    }

    const selectedInv = existingInventories.find(inv => inv._id === invId);
    if (selectedInv) {
      const formattedMfg = selectedInv.mfgDate ? new Date(selectedInv.mfgDate).toISOString().split('T')[0] : '';
      const formattedExp = selectedInv.expiryDate ? new Date(selectedInv.expiryDate).toISOString().split('T')[0] : '';

      setForm(prev => ({
        ...prev,
        inventoryId: invId,
        variantId: selectedInv.variantId?._id || '',
        batchNumber: selectedInv.batchNumber || '',
        mfgDate: formattedMfg,
        expiryDate: formattedExp,
        availableQty: 0, // specify quantity to add
        reservedQty: selectedInv.reservedQty || 0,
        lowStockLimit: selectedInv.lowStockLimit ?? 10,
        notes: selectedInv.notes || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.productId || !form.variantId) {
      toast.error("Please select a product and variant.");
      return;
    }
    if (!form.batchNumber.trim()) {
      toast.error("Batch number is required.");
      return;
    }
    if (!form.mfgDate || !form.expiryDate) {
      toast.error("Manufacturing and expiry dates are required.");
      return;
    }
    if (new Date(form.expiryDate) <= new Date(form.mfgDate)) {
      toast.error("Expiry date must be after manufacturing date.");
      return;
    }
    if (form.availableQty < 0) {
      toast.error("Available quantity cannot be negative.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(form.inventoryId ? "Updating existing batch stock..." : "Creating inventory stock entry...");

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: form.productId,
          variantId: form.variantId,
          batchNumber: form.batchNumber.trim(),
          mfgDate: new Date(form.mfgDate),
          expiryDate: new Date(form.expiryDate),
          availableQty: form.availableQty,
          reservedQty: form.reservedQty,
          lowStockLimit: form.lowStockLimit,
          notes: form.notes.trim(),
          inventoryId: form.inventoryId || undefined
        })
      });

      const json = await res.json();

      if (json.success) {
        toast.success(form.inventoryId ? "Stock added to batch successfully!" : "Stock entry created successfully!", { id: toastId });
        router.push('/admin/inventory');
      } else {
        throw new Error(json.message || "Failed to submit stock entry");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find(p => p._id === form.productId);
  const selectedVariant = variants.find(v => v._id === form.variantId);
  const productInventories = existingInventories.filter(inv => inv.productId?._id === form.productId);
  const selectedInventoryItem = existingInventories.find(inv => inv._id === form.inventoryId);
  const previousStock = selectedInventoryItem ? (selectedInventoryItem.availableQty || 0) : 0;
  const newCalculatedStock = previousStock + Number(form.availableQty || 0);

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4 animate-in fade-in duration-500 space-y-6">
      <PageHeader
        title="Add Stock Entry"
        description="Create a new warehouse inventory record by selecting a product variant and providing batch details."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Inventory', href: '/admin/inventory' },
          { label: 'Add Stock' }
        ]}
        backLink="/admin/inventory"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Product & Variant Selection */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center border border-green-100 shrink-0">
              <Icon icon="solar:box-bold-duotone" className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-gray-800 tracking-tight">Product & Variant</h3>
              <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Select the product and specific variant for this stock entry</p>
            </div>
          </div>

          <div className="p-7 space-y-5">
            {/* Product Select */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Product <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  required
                  disabled={loadingProducts}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                >
                  <option value="">
                    {loadingProducts ? "Loading products..." : "Select a product"}
                  </option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.brand ? `(${p.brand})` : ''}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <Icon icon="lucide:chevron-down" className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Existing Batch Dropdown (Optional) */}
            {form.productId && productInventories.length > 0 && (
              <div className="space-y-1.5 animate-in fade-in duration-300">
                <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-widest ml-1">
                  Existing Stock Batch / Record (Optional)
                </label>
                <div className="relative">
                  <select
                    name="inventoryId"
                    value={form.inventoryId}
                    onChange={handleInventoryChange}
                    className="w-full px-4 py-3 bg-purple-50/40 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-semibold appearance-none cursor-pointer pr-10"
                  >
                    <option value="">-- Create a new stock batch record from scratch --</option>
                    {productInventories.map(inv => {
                      const pack = [inv.variantId?.weight, inv.variantId?.unit?.shortName]
                        .filter(Boolean)
                        .join(' ');
                      return (
                        <option key={inv._id} value={inv._id}>
                          Add Stock to — SKU: {inv.variantId?.sku} • Batch: {inv.batchNumber} {pack ? `• ${pack}` : ''} (Current Stock: {inv.availableQty})
                        </option>
                      );
                    })}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-purple-400">
                    <Icon icon="lucide:chevron-down" className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-purple-500/80 ml-1">
                  💡 Select an existing batch to update its stock level and details, or leave empty to register a brand new batch.
                </p>
              </div>
            )}

            {/* Variant Select */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Variant <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="variantId"
                  value={form.variantId}
                  onChange={handleChange}
                  required
                  disabled={!form.productId || loadingVariants || !!form.inventoryId}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                >
                  <option value="">
                    {!form.productId
                      ? "Select a product first"
                      : loadingVariants
                        ? "Loading variants..."
                        : variants.length === 0
                          ? "No variants available"
                          : "Select a variant"}
                  </option>
                  {variants.map(v => (
                    <option key={v._id} value={v._id}>
                      SKU: {v.sku} — {v.weight || v.size || 0}{v.unit?.shortName || ''} — ₹{v.basePrice}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <Icon icon="lucide:chevron-down" className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Existing Batch / Variant Info Card */}
            {form.inventoryId ? (
              <div className="flex items-center gap-4 p-4 bg-purple-50/60 border border-purple-100 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                <span className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Icon icon="solar:info-square-bold-duotone" className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-purple-800">
                    Adding Stock to Existing Batch
                  </p>
                  <p className="text-[11px] font-semibold text-purple-600 mt-0.5">
                    Current stock level is <span className="font-bold text-purple-800">{existingInventories.find(inv => inv._id === form.inventoryId)?.availableQty || 0} units</span>. Entering a value below will add to this balance.
                  </p>
                </div>
                <span className="shrink-0 w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Icon icon="lucide:check" className="w-4 h-4" />
                </span>
              </div>
            ) : selectedVariant ? (
              <div className="flex items-center gap-4 p-4 bg-green-50/60 border border-green-100 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                {selectedVariant.images?.[0] ? (
                  <img
                    src={selectedVariant.images[0]}
                    alt={selectedVariant.sku}
                    className="w-12 h-12 rounded-xl object-cover border border-green-100 shrink-0"
                  />
                ) : (
                  <span className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:package" className="w-5 h-5" />
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-green-800 truncate">
                    {selectedProduct?.name} — {selectedVariant.sku}
                  </p>
                  <p className="text-[11px] font-semibold text-green-600 mt-0.5">
                    {selectedVariant.weight || selectedVariant.size || 0}{selectedVariant.unit?.shortName || ''} • ₹{selectedVariant.basePrice}
                  </p>
                </div>
                <span className="shrink-0 w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <Icon icon="lucide:check" className="w-4 h-4" />
                </span>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Section 2: Batch & Stock Details */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shrink-0">
              <Icon icon="solar:clipboard-list-bold-duotone" className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-gray-800 tracking-tight">Batch & Stock Details</h3>
              <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Enter warehouse batch information and stock quantities</p>
            </div>
          </div>

          <div className="p-7 space-y-5">
            {/* Batch Number */}
            <LabledInput
              label="Batch Number"
              name="batchNumber"
              value={form.batchNumber}
              onChange={handleChange}
              required
              disabled={!!form.inventoryId}
              placeholder="e.g. BATCH-2025-001"
            />

            {/* Dates: Mfg & Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LabledInput
                label="Manufacturing Date"
                type="date"
                name="mfgDate"
                value={form.mfgDate}
                onChange={handleChange}
                required
              />
              <LabledInput
                label="Expiry Date"
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Stock Quantities & Dynamic Calculations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LabledInput
                label="Quantity to Add"
                type="number"
                name="availableQty"
                value={form.availableQty}
                onChange={handleChange}
                required
                min={0}
                placeholder="0"
              />

              <LabledInput
                label="Previous Stock"
                type="number"
                disabled
                value={previousStock}
                className="bg-gray-100/50"
              />

              <LabledInput
                label="New Calculated Stock"
                type="number"
                disabled
                value={newCalculatedStock}
                className="bg-green-50/20 text-green-700 font-black border border-green-200"
              />
            </div>

            {/* Notes */}
            <LabledInput
              label="Stock Notes"
              type="textarea"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Optional batch notes, shipment details, quality review, etc."
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/inventory')}
            icon="lucide:arrow-left"
            className="!py-2 !px-4 !rounded-lg text-xs font-bold"
          >
            Back to Inventory
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm({
                productId: '',
                variantId: '',
                batchNumber: '',
                mfgDate: '',
                expiryDate: '',
                availableQty: 0,
                reservedQty: 0,
                lowStockLimit: 10,
                notes: '',
                inventoryId: ''
              })}
              icon="lucide:rotate-ccw"
              className="!py-2 !px-4 !rounded-lg text-xs font-bold"
            >
              Reset
            </Button>
            <Button
              type="submit"
              isLoading={saving}
              icon="lucide:plus"
              className="!py-2.5 !px-6 !rounded-lg text-xs font-bold"
            >
              Add Stock Entry
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStockPage;
