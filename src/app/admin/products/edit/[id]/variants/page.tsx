"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/components/shared/PageHeader';
import Card from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown';

interface VariantState {
  _id?: string;
  value: string;
  unit: string;
  price: string;
  stock: string;
  sku: string;
  images: string[];
  packaging: string[];
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  notes: string;
  showInventory: boolean;
}

interface ProductVariantsPageProps {
  params: Promise<{ id: string }>;
}

const ProductVariantsPage = ({ params }: ProductVariantsPageProps) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State for Adding / Editing a Single Variant
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  
  const [variantForm, setVariantForm] = useState<VariantState>({
    value: '',
    unit: '',
    price: '',
    stock: '',
    sku: '',
    images: [],
    packaging: [],
    batchNumber: '',
    mfgDate: '',
    expiryDate: '',
    notes: '',
    showInventory: false
  });

  const loadData = () => {
    setFetching(true);
    Promise.all([
      fetch(`/api/products/${productId}`).then(res => res.json()),
      fetch('/api/admin/units').then(res => res.json()),
      fetch('/api/admin/packaging').then(res => res.json()),
    ]).then(([prodRes, unitRes, packRes]) => {
      if (prodRes.success) setProduct(prodRes.data);
      if (unitRes.success) setUnits(unitRes.data);
      if (packRes.success) setPackagingOptions(packRes.data);
    })
    .catch(() => toast.error("Failed to fetch product, units, or packaging parameters"))
    .finally(() => setFetching(false));
  };

  useEffect(() => {
    loadData();
  }, [productId]);

  const resetForm = () => {
    setVariantForm({
      value: '',
      unit: '',
      price: '',
      stock: '',
      sku: '',
      images: [],
      packaging: [],
      batchNumber: '',
      mfgDate: '',
      expiryDate: '',
      notes: '',
      showInventory: false
    });
    setEditingVariantId(null);
    setIsFormOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v: any) => {
    setEditingVariantId(v._id);
    
    // Setup initial dates
    const formattedMfg = v.mfgDate ? new Date(v.mfgDate).toISOString().split('T')[0] : '';
    const formattedExp = v.expiryDate ? new Date(v.expiryDate).toISOString().split('T')[0] : '';

    setVariantForm({
      _id: v._id,
      value: String(v.weight || v.size || v.value || ''),
      unit: v.unit?._id || v.unit || '',
      price: String(v.basePrice || v.price || ''),
      stock: String(v.stock || '0'),
      sku: v.sku || '',
      images: v.images || [],
      packaging: (v.packaging || []).map((p: any) => p._id || p),
      batchNumber: v.batchNumber || '',
      mfgDate: formattedMfg,
      expiryDate: formattedExp,
      notes: v.notes || '',
      showInventory: !!(v.batchNumber || v.mfgDate || v.expiryDate)
    });
    setIsFormOpen(true);
  };

  const handleFormChange = (field: keyof VariantState, value: any) => {
    setVariantForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePackaging = (id: string) => {
    setVariantForm(prev => {
      const list = [...prev.packaging];
      const index = list.indexOf(id);
      if (index > -1) list.splice(index, 1);
      else list.push(id);
      return { ...prev, packaging: list };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading("Uploading images to Cloudinary...");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", "products");
        body.append("resource_type", "image");

        const res = await fetch("/api/upload", {
          method: "POST",
          body,
        });

        const json = await res.json();
        if (json.success) {
          return json.data.url;
        } else {
          throw new Error(json.message || "Failed to upload");
        }
      });

      const urls = await Promise.all(uploadPromises);
      
      setVariantForm(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));

      toast.success("Images uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imgIndex: number) => {
    setVariantForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== imgIndex)
    }));
  };

  const moveImage = (imgIndex: number, direction: 'left' | 'right') => {
    const images = [...variantForm.images];
    const targetIndex = direction === 'left' ? imgIndex - 1 : imgIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < images.length) {
      const temp = images[imgIndex];
      images[imgIndex] = images[targetIndex];
      images[targetIndex] = temp;
      setVariantForm(prev => ({ ...prev, images }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (variantForm.images.length === 0) {
      toast.error("Please upload at least one variant image.");
      setLoading(false);
      return;
    }

    const payload = {
      value: Number(variantForm.value),
      unit: variantForm.unit,
      price: Number(variantForm.price),
      stock: Number(variantForm.stock),
      sku: variantForm.sku,
      images: variantForm.images,
      packaging: variantForm.packaging,
      batchNumber: variantForm.batchNumber || undefined,
      mfgDate: variantForm.mfgDate ? new Date(variantForm.mfgDate) : undefined,
      expiryDate: variantForm.expiryDate ? new Date(variantForm.expiryDate) : undefined,
      notes: variantForm.notes || undefined
    };

    const url = editingVariantId 
      ? `/api/products/variants/${editingVariantId}`
      : `/api/products/${productId}/variants`;

    const method = editingVariantId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success) {
        toast.success(editingVariantId ? "Variant updated successfully!" : "Variant added successfully!");
        resetForm();
        loadData();
      } else {
        toast.error(json.message || "Failed to save variant");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant? This will permanently wipe its warehouse inventory.")) return;

    const toastId = toast.loading("Deleting variant...");
    try {
      const res = await fetch(`/api/products/variants/${variantId}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Variant deleted successfully!", { id: toastId });
        loadData();
      } else {
        throw new Error(json.message || "Deletion failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete variant", { id: toastId });
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
        <p className="text-sm font-bold text-gray-500">Loading variant portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Manage Variants"
        description={`Product: ${product?.name || ''} • Brand: ${product?.brand || 'Raman Green'}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'Edit Product', href: `/admin/products/edit/${productId}` },
          { label: 'Manage Variants' }
        ]}
        backLink={`/admin/products/edit/${productId}`}
        actionNode={
          !isFormOpen && (
            <Button 
              onClick={handleOpenAdd}
              icon="lucide:plus"
              className="!rounded-2xl"
            >
              Add Variant Option
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Existing Variants list */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">Configured Variants</h3>
          
          <div className="space-y-4">
            {product?.variants && product.variants.map((v: any, idx: number) => (
              <Card key={v._id || idx} className="!p-6 border-gray-100 hover:border-green-100 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Variant thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {v.images?.[0] ? (
                      <img src={v.images[0]} alt="Variant" className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="lucide:image" className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-800 flex items-center gap-2">
                      {v.weight || v.value || ''} {v.unit?.shortName || v.unit?.name || ''}
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 px-2 py-0.5 border border-gray-100 rounded-lg">
                        {v.sku}
                      </span>
                    </h4>
                    <p className="text-xs text-green-600 font-bold mt-1">
                      Price: ₹{v.basePrice || v.price} • Stock: {v.stock} units
                    </p>
                    {/* Display Packaging Under Variant */}
                    {v.packaging && v.packaging.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {v.packaging.map((pack: any) => (
                          <span key={pack._id} className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 border border-purple-100/50 px-2 py-0.5 rounded-lg">
                            {pack.name} ({pack.type})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t border-gray-50 md:border-none pt-3 md:pt-0">
                  <button 
                    onClick={() => handleOpenEdit(v)}
                    className="px-3.5 py-2 hover:bg-green-50 text-green-600 rounded-xl text-xs font-black transition-colors flex items-center gap-1 border border-green-100/50"
                  >
                    <Icon icon="lucide:edit" className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(v._id)}
                    className="px-3.5 py-2 hover:bg-red-50 text-red-500 rounded-xl text-xs font-black transition-colors flex items-center gap-1 border border-red-100/50"
                  >
                    <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </Card>
            ))}

            {(!product?.variants || product.variants.length === 0) && (
              <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl text-sm font-semibold text-gray-400 bg-gray-50/50">
                No variants configured for this base product yet. Add your first variant option using the button on the right!
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Form for Adding / Editing a Single Variant */}
        <div className="space-y-6">
          {isFormOpen ? (
            <Card className="!p-6 border-gray-100 shadow-lg animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-4">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon icon={editingVariantId ? "lucide:edit-3" : "lucide:plus-circle"} className="w-4 h-4 text-green-600" />
                  {editingVariantId ? 'Edit Variant Option' : 'Add New Variant'}
                </h3>
                <button 
                  onClick={resetForm}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <Icon icon="lucide:x" className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Size/Weight Value</label>
                    <input 
                      type="number" 
                      required
                      value={variantForm.value}
                      onChange={(e) => handleFormChange('value', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-semibold text-xs" 
                      placeholder="e.g. 50, 100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                    <select 
                      required
                      value={variantForm.unit}
                      onChange={(e) => handleFormChange('unit', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-xs cursor-pointer"
                    >
                      <option value="">Select Unit</option>
                      {units.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.shortName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={variantForm.price}
                      onChange={(e) => handleFormChange('price', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-semibold text-xs" 
                      placeholder="e.g. 299"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Stock Qty</label>
                    <input 
                      type="number" 
                      required
                      value={variantForm.stock}
                      onChange={(e) => handleFormChange('stock', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-semibold text-xs" 
                      placeholder="e.g. 100"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Variant SKU</label>
                    <input 
                      type="text" 
                      required
                      value={variantForm.sku}
                      onChange={(e) => handleFormChange('sku', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-semibold text-xs uppercase" 
                      placeholder="Unique SKU"
                    />
                  </div>

                  {/* Packaging Selection Under Variant */}
                  <div className="col-span-2 pt-2">
                    <MultiSelectDropdown 
                       label="Packaging Options (Variant Specific)"
                       options={packagingOptions.map(p => ({ id: p._id, label: p.name, subLabel: p.type }))}
                       selectedValues={variantForm.packaging}
                       onChange={togglePackaging}
                       placeholder="Select packaging types"
                    />
                  </div>
                </div>

                {/* Cloudinary Gallery */}
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Gallery Images (Required)</label>
                  
                  <div className="border-2 border-dashed border-gray-100 hover:border-green-400 hover:bg-green-50/10 rounded-2xl p-4 text-center cursor-pointer relative flex flex-col items-center justify-center min-h-[90px] transition-all">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <Icon icon="solar:camera-add-bold-duotone" className="w-6 h-6 text-green-600 mb-1" />
                    <p className="text-[10px] font-black text-gray-700">Upload Variant Photos</p>
                  </div>

                  {/* Previews */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {variantForm.images.map((url, imgIdx) => {
                      const displayUrl = url.startsWith('http') 
                        ? url 
                        : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dummy'}/image/upload/${url}`;

                      return (
                        <div key={imgIdx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                          <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button 
                              type="button" 
                              disabled={imgIdx === 0}
                              onClick={() => moveImage(imgIdx, 'left')} 
                              className="p-0.5 bg-white rounded text-gray-700 hover:text-green-600 disabled:opacity-30"
                            >
                              <Icon icon="lucide:chevron-left" className="w-3 h-3" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => removeImage(imgIdx)} 
                              className="p-0.5 bg-white rounded text-red-500 hover:bg-red-50"
                            >
                              <Icon icon="lucide:trash" className="w-3 h-3" />
                            </button>
                            <button 
                              type="button" 
                              disabled={imgIdx === variantForm.images.length - 1}
                              onClick={() => moveImage(imgIdx, 'right')} 
                              className="p-0.5 bg-white rounded text-gray-700 hover:text-green-600 disabled:opacity-30"
                            >
                              <Icon icon="lucide:chevron-right" className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Initial warehouse inventory toggle */}
                <div className="pt-2 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => handleFormChange('showInventory', !variantForm.showInventory)}
                    className="text-[10px] font-black text-green-600 hover:text-green-700 transition-colors flex items-center gap-0.5"
                  >
                    <Icon icon="lucide:chevron-right" className={`w-3.5 h-3.5 transform transition-transform ${variantForm.showInventory ? 'rotate-90' : ''}`} />
                    Warehouse Inventory parameters
                  </button>

                  {variantForm.showInventory && (
                    <div className="space-y-3 mt-3 p-4 bg-green-50/10 border border-green-100/50 rounded-xl animate-in slide-in-from-top duration-300">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Batch Number</label>
                        <input 
                          type="text" 
                          value={variantForm.batchNumber}
                          onChange={(e) => handleFormChange('batchNumber', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" 
                          placeholder="e.g. BATCH-01 (Auto generated)"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Mfg Date</label>
                        <input 
                          type="date" 
                          value={variantForm.mfgDate}
                          onChange={(e) => handleFormChange('mfgDate', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Expiry Date</label>
                        <input 
                          type="date" 
                          value={variantForm.expiryDate}
                          onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Inventory Notes</label>
                        <input 
                          type="text" 
                          value={variantForm.notes}
                          onChange={(e) => handleFormChange('notes', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" 
                          placeholder="Warehouse arrival notes..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-50">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="!py-2 !px-4 !rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    isLoading={loading}
                    className="!py-2 !px-6 !rounded-xl text-xs font-bold"
                  >
                    {editingVariantId ? 'Save Variant' : 'Create Variant'}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="border border-dashed border-gray-200 p-8 rounded-2xl text-center bg-gray-50/50 flex flex-col items-center justify-center min-h-[300px]">
              <Icon icon="solar:box-add-bold-duotone" className="w-12 h-12 text-gray-300 mb-2" />
              <h4 className="text-xs font-black text-gray-600 uppercase tracking-wider">No Variant Form Open</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Click "+ Add Variant Option" or "Edit" on any card to begin managing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductVariantsPage;
