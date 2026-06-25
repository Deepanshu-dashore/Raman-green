"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { useDropzone } from 'react-dropzone';
import { PageHeader } from '@/components/shared/PageHeader';
import Card from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown';
import { DataTable } from '@/components/shared/DataTable';
import type { VariantImageOrderItem } from '@/app/lib/featuers/product-variant/variant.form';
import DeleteModal from '@/components/shared/DeleteModal';
import LabledInput from '@/components/shared/LabledInput';


type GalleryItem =
  | { id: string; kind: 'saved'; url: string }
  | { id: string; kind: 'local'; file: File; preview: string };

interface VariantState {
  _id?: string;
  value: string;
  unit: string;
  price: string;
  stock: string;
  lowStockLimit: string;
  sku: string;
  packaging: string[];
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  notes: string;
  usageInstructions: string;
  showInventory: boolean;
}

const newGalleryId = () => `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface ProductVariantsPageProps {
  params: Promise<{ id: string }>;
}

const ProductVariantsPage = ({ params }: ProductVariantsPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantIdParam = searchParams.get("variantId");
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantNotFound, setVariantNotFound] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variantIdToDelete, setVariantIdToDelete] = useState<string | null>(null);

  const [variantForm, setVariantForm] = useState<VariantState>({
    value: '',
    unit: '',
    price: '',
    stock: '',
    lowStockLimit: '10',
    sku: '',
    packaging: [],
    batchNumber: '',
    mfgDate: '',
    expiryDate: '',
    notes: '',
    usageInstructions: '',
    showInventory: false
  });

  const revokeGalleryPreviews = (items: GalleryItem[]) => {
    items.forEach((item) => {
      if (item.kind === 'local') URL.revokeObjectURL(item.preview);
    });
  };

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


  const clearFormFields = () => {
    setVariantForm({
      value: '',
      unit: '',
      price: '',
      stock: '',
      lowStockLimit: '10',
      sku: '',
      packaging: [],
      batchNumber: '',
      mfgDate: '',
      expiryDate: '',
      notes: '',
      usageInstructions: '',
      showInventory: false
    });
    setEditingVariantId(null);
  };

  const resetForm = () => {
    revokeGalleryPreviews(gallery);
    setGallery([]);
    clearFormFields();
    setIsFormOpen(false);
    if (variantIdParam) {
      router.push(`/admin/products/edit/${productId}`);
    }
  };

  const handleOpenAdd = () => {
    revokeGalleryPreviews(gallery);
    setGallery([]);
    clearFormFields();
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
      lowStockLimit: String(v.lowStockLimit ?? '10'),
      sku: v.sku || '',
      packaging: (v.packaging || []).map((p: any) => p._id || p),
      batchNumber: v.batchNumber || '',
      mfgDate: formattedMfg,
      expiryDate: formattedExp,
      notes: v.notes || '',
      usageInstructions: Array.isArray(v.usageInstructions) ? v.usageInstructions.join('\n') : (v.usageInstructions || ''),
      showInventory: !!(v.batchNumber || v.mfgDate || v.expiryDate || v.lowStockLimit)
    });
    revokeGalleryPreviews(gallery);
    setGallery(
      (v.images || []).map((url: string) => ({
        id: newGalleryId(),
        kind: 'saved' as const,
        url,
      }))
    );
    setIsFormOpen(true);
  };

  useEffect(() => {
    loadData();
    if (variantIdParam) {
      setVariantLoading(true);
      setVariantNotFound(false);
      fetch(`/api/products/${productId}/variants/${variantIdParam}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            handleOpenEdit(json.data);
          } else {
            setVariantNotFound(true);
          }
        })
        .catch((err) => {
          console.error("Failed to load specific variant:", err);
          setVariantNotFound(true);
        })
        .finally(() => {
          setVariantLoading(false);
        });
    }
  }, [productId, variantIdParam]);

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

  const addFilesToGallery = useCallback((files: File[]) => {
    const newItems: GalleryItem[] = files.map((file) => ({
      id: newGalleryId(),
      kind: 'local',
      file,
      preview: URL.createObjectURL(file),
    }));
    setGallery((prev) => [...prev, ...newItems]);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) addFilesToGallery(acceptedFiles);
    },
    [addFilesToGallery]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    disabled: loading,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      toast.error(err?.message || 'Invalid image file.');
    },
  });

  const removeImage = (imgIndex: number) => {
    setGallery((prev) => {
      const item = prev[imgIndex];
      if (item?.kind === 'local') URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== imgIndex);
    });
  };

  const moveImage = (imgIndex: number, direction: 'left' | 'right') => {
    setGallery((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'left' ? imgIndex - 1 : imgIndex + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[imgIndex], next[targetIndex]] = [next[targetIndex], next[imgIndex]];
      return next;
    });
  };

  const buildVariantFormData = () => {
    const body = new FormData();
    body.append('value', variantForm.value);
    body.append('unit', variantForm.unit);
    body.append('price', variantForm.price);
    body.append('stock', variantForm.stock);
    body.append('lowStockLimit', variantForm.lowStockLimit);
    body.append('sku', variantForm.sku);
    body.append('packaging', JSON.stringify(variantForm.packaging));
    if (variantForm.batchNumber) body.append('batchNumber', variantForm.batchNumber);
    if (variantForm.mfgDate) body.append('mfgDate', variantForm.mfgDate);
    if (variantForm.expiryDate) body.append('expiryDate', variantForm.expiryDate);
    if (variantForm.notes) body.append('notes', variantForm.notes);
    body.append('usageInstructions', variantForm.usageInstructions || '');

    const imageOrder: VariantImageOrderItem[] = [];
    let newIndex = 0;

    gallery.forEach((item) => {
      if (item.kind === 'saved') {
        imageOrder.push({ type: 'existing', url: item.url });
      } else {
        imageOrder.push({ type: 'new', index: newIndex });
        body.append('images', item.file);
        newIndex += 1;
      }
    });

    body.append('imageOrder', JSON.stringify(imageOrder));
    return body;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (gallery.length === 0) {
      toast.error("Please add at least one variant image.");
      setLoading(false);
      return;
    }

    const url = editingVariantId
      ? `/api/products/variants/${editingVariantId}`
      : `/api/products/${productId}/variants`;

    const method = editingVariantId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        body: buildVariantFormData(),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(editingVariantId ? 'Variant updated successfully!' : 'Variant added successfully!');
        resetForm();
        if (!variantIdParam) {
          loadData();
        }
      } else {
        toast.error(json.message || 'Failed to save variant.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (v: any) => {
    const id = typeof v === 'object' && v ? v._id : v;
    setVariantIdToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!variantIdToDelete) return;
    setDeleteModalOpen(false);

    const toastId = toast.loading("Deleting variant...");
    try {
      const res = await fetch(`/api/products/variants/${variantIdToDelete}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Variant deleted successfully!", { id: toastId });
        setVariantIdToDelete(null);
        loadData();
      } else {
        throw new Error(json.message || "Deletion failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete variant", { id: toastId });
    }
  };

  if (fetching || variantLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
        <p className="text-sm font-bold text-gray-500">
          {variantLoading ? "Loading variant information..." : "Loading variant portal..."}
        </p>
      </div>
    );
  }

  if (variantNotFound) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
          <Icon icon="lucide:alert-circle" className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Variant not found</h2>
        <p className="text-sm text-gray-500">
          This variant may have been removed or the link is invalid.
        </p>
        <Button onClick={() => router.push(`/admin/products/edit/${productId}`)} icon="lucide:arrow-left">
          Back to base product
        </Button>
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
        backLink={-1}
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

      <div className="flex flex-col gap-4 mt-4">
        {/* Configured Variants Table */}
        <div className="order-2 space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Configured Variants</h3>

          <div className="space-y-4">
            <DataTable
              data={product?.variants || []}
              columns={[
                // {
                //   key: 'thumbnail',
                //   label: '',
                //   sortable: false,
                //   render: (row: any) =>
                //     row.images?.[0] ? (
                //       <img src={row.images[0]} alt="Variant" className="w-12 h-12 object-cover rounded" />
                //     ) : (
                //       <Icon icon="lucide:image" className="w-6 h-6 text-gray-300" />
                //     ),
                // },
                {
                  key: 'variant',
                  label: 'Variant',
                  type: 'user',
                  getAvatar: (row: any) => row.images?.[0] || row.name?.charAt(0) || '?',
                  getTitle: (row: any) => row.sku,
                },
                // {
                //   key: 'sku',
                //   label: 'SKU',
                //   // sortable: true,
                //   render: (row: any) => row.sku,
                // },
                {
                  key: 'description',
                  label: 'Description',
                  render: (row: any) => (
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {row.weight || row.value || ''} {row.unit?.shortName || row.unit?.name || ''}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'price',
                  label: 'Price',
                  // sortable: true,
                  render: (row: any) => `₹${row.basePrice || row.price}`,
                },
                {
                  key: 'stock',
                  label: 'Stock',
                  sortable: true,
                  render: (row: any) => row.stock,
                },
                {
                  key: 'packaging',
                  label: 'Packaging',
                  render: (row: any) =>
                    row.packaging?.map((pack: any, pIdx: number) => {
                      const key = typeof pack === 'object' && pack ? (pack._id || pack.id || `pack-${pIdx}`) : (pack || `pack-${pIdx}`);
                      const label = typeof pack === 'object' && pack ? `${pack.name} (${pack.type})` : `Packaging ID: ${pack}`;
                      return (
                        <span key={key} className="text-[9px] font-semibold uppercase text-purple-600 bg-purple-50 border border-purple-100/50 px-2 py-0.5 rounded-lg mr-1">
                          {label}
                        </span>
                      );
                    }),
                },
                {
                  key: 'usageInstructions',
                  label: 'Usage Instructions',
                  render: (row: any) => {
                    const insts = Array.isArray(row.usageInstructions)
                      ? row.usageInstructions.join(', ')
                      : (row.usageInstructions || '');
                    return (
                      <span className="text-[12px] text-gray-500 font-medium line-clamp-2 max-w-[200px]" title={insts}>
                        {insts || '-'}
                      </span>
                    );
                  },
                },
              ]}
              loading={loading}
              rowKey={(row: any) => row._id || row.id}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              showCheckBox={false}
            />

            {(!product?.variants || product.variants.length === 0) && (
              <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl text-sm font-semibold text-gray-400 bg-gray-50/50">
                No variants configured for this base product yet. Add your first variant option using the button on the right!
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Variant Form — shown above the table */}
        <div className="order-1">
          {isFormOpen && (
            <Card className="!p-0 border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-green-50 text-green-700 border border-green-100 flex items-center justify-center">
                    <Icon icon={editingVariantId ? "lucide:edit-3" : "lucide:plus"} className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight">
                      {editingVariantId ? 'Edit Variant' : 'Add Variant'}
                    </h3>
                    <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Pricing, stock, media, and packaging</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 hover:bg-gray-100 rounded-full transition-colors text-gray-400 flex items-center justify-center"
                >
                  <Icon icon="lucide:x" className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <LabledInput
                    label="Size"
                    type="number"
                    required
                    value={variantForm.value}
                    onChange={(e) => handleFormChange('value', e.target.value)}
                    placeholder="50"
                  />

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Unit</label>
                    <select
                      required
                      value={variantForm.unit}
                      onChange={(e) => handleFormChange('unit', e.target.value)}
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-semibold text-xs cursor-pointer transition-all"
                    >
                      <option value="">Unit</option>
                      {units.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.shortName})</option>
                      ))}
                    </select>
                  </div>

                  <LabledInput
                    label="Price (₹)"
                    type="number"
                    required
                    value={variantForm.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    placeholder="299"
                  />

                  <LabledInput
                    label="Stock"
                    type="number"
                    required
                    value={variantForm.stock}
                    onChange={(e) => handleFormChange('stock', e.target.value)}
                    placeholder="100"
                  />

                  <LabledInput
                    label="Low Limit"
                    type="number"
                    required
                    min="0"
                    value={variantForm.lowStockLimit}
                    onChange={(e) => handleFormChange('lowStockLimit', e.target.value)}
                    placeholder="10"
                  />

                  <LabledInput
                    label="SKU"
                    type="text"
                    required
                    value={variantForm.sku}
                    onChange={(e) => handleFormChange('sku', e.target.value)}
                    placeholder="RG-001"
                    className="col-span-2 lg:col-span-2"
                  />

                  {/* Packaging Selection Under Variant */}
                  <div className="col-span-2 lg:col-span-3 mt-3">
                    <MultiSelectDropdown
                      label="Packaging"
                      options={packagingOptions.map(p => ({ id: p._id, label: p.name, subLabel: p.type }))}
                      selectedValues={variantForm.packaging}
                      onChange={togglePackaging}
                      placeholder="Select packaging"
                    />
                  </div>

                  {/* Usage Instructions */}
                  <div className="col-span-2 lg:col-span-5 mt-3">
                    <LabledInput
                      label="Usage Instructions"
                      type="textarea"
                      value={variantForm.usageInstructions}
                      onChange={(e) => handleFormChange('usageInstructions', e.target.value)}
                      placeholder="e.g. Take 1 scoop daily with water or milk after your workout."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Gallery — multipart upload on save */}
                <div className="grid lg:grid-cols-[240px_1fr] gap-4 pt-4 border-t border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide lg:col-span-2">Gallery Images</label>

                  <div
                    {...getRootProps()}
                    className={`border border-dashed rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center min-h-40 transition-all outline-none ${loading
                      ? 'opacity-60 pointer-events-none border-gray-100 bg-gray-50'
                      : isDragActive
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50/70 hover:border-green-400 hover:bg-green-50/40'
                      }`}
                  >
                    <input {...getInputProps()} />
                    <span className="w-11 h-11 rounded-sm bg-white border border-green-100 text-green-700 flex items-center justify-center mb-3">
                      <Icon icon="lucide:image-plus" className="w-5 h-5" />
                    </span>
                    <p className="text-xs font-black text-gray-800 text-center">
                      {isDragActive ? 'Drop images' : 'Upload images'}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-1 text-center">PNG, JPG, WEBP, GIF</p>
                  </div>

                  <div className="min-h-40 rounded-xl border border-gray-100 bg-white p-3 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-2 content-start">
                    {gallery.length === 0 && (
                      <div className="col-span-full h-24 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-400">
                        No images selected
                      </div>
                    )}
                    {gallery.map((item, imgIdx) => {
                      const displayUrl =
                        item.kind === 'saved'
                          ? item.url
                          : item.preview;

                      return (
                        <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                          <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
                          {item.kind === 'local' && (
                            <span className="absolute left-1 top-1 bg-green-600 text-[8px] text-white font-black px-1.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={imgIdx === 0}
                              onClick={() => moveImage(imgIdx, 'left')}
                              className="w-6 h-6 bg-white rounded-md text-gray-700 hover:text-green-600 disabled:opacity-30 flex items-center justify-center"
                            >
                              <Icon icon="lucide:chevron-left" className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(imgIdx)}
                              className="w-6 h-6 bg-white rounded-md text-red-500 hover:bg-red-50 flex items-center justify-center"
                            >
                              <Icon icon="lucide:trash" className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={imgIdx === gallery.length - 1}
                              onClick={() => moveImage(imgIdx, 'right')}
                              className="w-6 h-6 bg-white rounded-md text-gray-700 hover:text-green-600 disabled:opacity-30 flex items-center justify-center"
                            >
                              <Icon icon="lucide:chevron-right" className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <fieldset className="border border-gray-200 rounded-xl px-3 pb-3 pt-2">
                  <legend className="px-2">
                    <button
                      type="button"
                      onClick={() => handleFormChange('showInventory', !variantForm.showInventory)}
                      className="h-7 px-2 bg-white text-[11px] font-black text-gray-600 hover:text-green-700 transition-colors flex items-center gap-1"
                    >
                      <Icon icon="lucide:chevron-right" className={`w-3.5 h-3.5 transform transition-transform ${variantForm.showInventory ? 'rotate-90' : ''}`} />
                      Warehouse details
                    </button>
                  </legend>

                  {variantForm.showInventory ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in slide-in-from-top duration-300">
                      <LabledInput
                        label="Batch"
                        type="text"
                        value={variantForm.batchNumber}
                        onChange={(e) => handleFormChange('batchNumber', e.target.value)}
                        placeholder="Auto generated"
                      />

                      <LabledInput
                        label="Mfg Date"
                        type="date"
                        value={variantForm.mfgDate}
                        onChange={(e) => handleFormChange('mfgDate', e.target.value)}
                      />

                      <LabledInput
                        label="Expiry"
                        type="date"
                        value={variantForm.expiryDate}
                        onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                      />

                      <LabledInput
                        label="Notes"
                        type="text"
                        value={variantForm.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        placeholder="Arrival notes"
                      />
                    </div>
                  ) : (
                    <div className="h-8 flex items-center text-[11px] font-semibold text-gray-400">
                      Optional batch, manufacturing, expiry, and notes.
                    </div>
                  )}
                </fieldset>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="!py-2 !px-4 !rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={loading}
                    className="!py-2.5 !px-6 !rounded-lg text-xs font-bold"
                  >
                    {editingVariantId ? 'Save Variant' : 'Create Variant'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setVariantIdToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Variant"
        message="Are you sure you want to delete this variant? This will permanently wipe its warehouse inventory."
        confirmButtonText="Delete Variant"
      />
    </div>
  );
};

export default ProductVariantsPage;
