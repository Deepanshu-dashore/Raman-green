"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown';
import { PageHeader } from '@/components/shared/PageHeader';
import Card from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

interface VariantState {
  _id?: string;
  value: string;
  unit: string;
  price: string;
  stock: string;
  sku: string;
  images: string[];
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  notes: string;
  showInventory: boolean;
}

interface EditProductProps {
  params: Promise<{ id: string }>;
}

const EditProduct = ({ params }: EditProductProps) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<any[]>([]);
  const [certificateOptions, setCertificateOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    brand: 'Raman Green',
    isFeatured: false,
    variants: [] as VariantState[],
    certificates: [] as string[],
    packaging: [] as string[]
  });

  useEffect(() => {
    // 1. Fetch reference options
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/admin/units').then(res => res.json()),
      fetch('/api/admin/packaging').then(res => res.json()),
      fetch('/api/admin/certificates').then(res => res.json()),
    ]).then(([cat, uni, pack, cert]) => {
      if (cat.success) setCategories(cat.data);
      if (uni.success) setUnits(uni.data);
      if (pack.success) setPackagingOptions(pack.data);
      if (cert.success) setCertificateOptions(cert.data);
      
      // 2. Fetch the target product
      return fetch(`/api/products/${productId}`).then(res => res.json());
    }).then((prodJson) => {
      if (prodJson && prodJson.success && prodJson.data) {
        const prod = prodJson.data;
        
        // Map variants correctly
        const mappedVariants = (prod.variants || []).map((v: any) => ({
          _id: v._id,
          value: String(v.weight || v.size || v.value || ''),
          unit: v.unit?._id || v.unit || '',
          price: String(v.basePrice || v.price || ''),
          stock: String(v.stock || '0'),
          sku: v.sku || '',
          images: v.images || [],
          batchNumber: '',
          mfgDate: '',
          expiryDate: '',
          notes: '',
          showInventory: false
        }));

        // Fill formData
        setFormData({
          name: prod.name || '',
          slug: prod.slug || '',
          description: prod.description || '',
          category: prod.category?._id || prod.category || '',
          brand: prod.brand || 'Raman Green',
          isFeatured: !!prod.isFeatured,
          variants: mappedVariants.length > 0 ? mappedVariants : [{ 
            value: '', 
            unit: '', 
            price: '', 
            stock: '', 
            sku: '', 
            images: [],
            batchNumber: '',
            mfgDate: '',
            expiryDate: '',
            notes: '',
            showInventory: false
          }],
          certificates: (prod.certificates || []).map((c: any) => c._id || c),
          packaging: (prod.packaging || []).map((p: any) => p._id || p)
        });
      } else {
        toast.error("Product not found");
      }
    })
    .catch((err) => {
      toast.error("Failed to load options or product details");
    })
    .finally(() => {
      setFetching(false);
    });
  }, [productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val,
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') } : {})
    }));
  };

  const handleVariantChange = (index: number, field: keyof VariantState, value: any) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = {
        ...newVariants[index],
        [field]: value
      };
      return { ...prev, variants: newVariants };
    });
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { 
          value: '', 
          unit: '', 
          price: '', 
          stock: '', 
          sku: '', 
          images: [],
          batchNumber: '',
          mfgDate: '',
          expiryDate: '',
          notes: '',
          showInventory: false
        }
      ]
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  const handleVariantFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingIndex(index);
    const toastId = toast.loading(`Uploading images to Cloudinary for Variant #${index + 1}...`);

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
          return json.data.url; // Relative Cloudinary URL key
        } else {
          throw new Error(json.message || "Failed to upload");
        }
      });

      const urls = await Promise.all(uploadPromises);
      
      setFormData(prev => {
        const newVariants = [...prev.variants];
        const currentImages = newVariants[index].images || [];
        newVariants[index] = {
          ...newVariants[index],
          images: [...currentImages, ...urls]
        };
        return { ...prev, variants: newVariants };
      });

      toast.success("Images uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const currentImages = newVariants[variantIndex].images || [];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        images: currentImages.filter((_, i) => i !== imageIndex)
      };
      return { ...prev, variants: newVariants };
    });
  };

  const moveVariantImage = (variantIndex: number, imageIndex: number, direction: 'left' | 'right') => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const currentImages = [...(newVariants[variantIndex].images || [])];
      const targetIndex = direction === 'left' ? imageIndex - 1 : imageIndex + 1;
      
      if (targetIndex >= 0 && targetIndex < currentImages.length) {
        const temp = currentImages[imageIndex];
        currentImages[imageIndex] = currentImages[targetIndex];
        currentImages[targetIndex] = temp;
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          images: currentImages
        };
      }
      return { ...prev, variants: newVariants };
    });
  };

  const toggleFeature = (id: string, type: 'certificates' | 'packaging') => {
    setFormData(prev => {
      const list = [...(prev[type] as string[])];
      const index = list.indexOf(id);
      if (index > -1) list.splice(index, 1);
      else list.push(id);
      return { ...prev, [type]: list };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate variants images
      for (let i = 0; i < formData.variants.length; i++) {
        const v = formData.variants[i];
        if (!v.images || v.images.length === 0) {
          toast.error(`Please upload at least one image for Variant #${i + 1}`);
          setLoading(false);
          return;
        }
        if (!v.sku || v.sku.trim() === '') {
          toast.error(`SKU is required for Variant #${i + 1}`);
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        variants: formData.variants.map(v => ({
          _id: v._id,
          value: Number(v.value),
          unit: v.unit,
          price: Number(v.price),
          stock: Number(v.stock),
          sku: v.sku,
          images: v.images,
          batchNumber: v.batchNumber || undefined,
          mfgDate: v.mfgDate || undefined,
          expiryDate: v.expiryDate || undefined,
          notes: v.notes || undefined
        }))
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Product and variants updated successfully!");
        router.push('/admin/products');
      } else {
        toast.error(json.message || "Failed to update product");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
        <p className="text-sm font-bold text-gray-500">Loading product information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Edit Product"
        description="Modify basic details, pricing variants, and sync inventory levels for this product catalog."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'Edit Product' }
        ]}
        backLink="/admin/products"
      />

      <form onSubmit={handleSubmit} className="space-y-8 mt-6">
        {/* Basic Info */}
        <Card className="!p-8 border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold border-b border-gray-100 pb-4 text-gray-800">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-semibold text-sm" 
                placeholder="e.g. Premium Broccoli Microgreens"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Slug (URL)</label>
              <input 
                type="text" 
                name="slug"
                required
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-semibold text-sm" 
                placeholder="slug-url"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Brand</label>
              <input 
                type="text" 
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-semibold text-sm" 
                placeholder="Brand name"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Description</label>
              <textarea 
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-semibold text-sm min-h-[100px]" 
                placeholder="Write detailed product benefits, descriptions, etc..."
              />
            </div>

            <div className="flex items-center space-x-3 mt-2">
              <input 
                type="checkbox" 
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-5 h-5 text-green-600 border-gray-300 rounded-lg focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700 cursor-pointer">Mark as Featured Product</label>
            </div>
          </div>
        </Card>

        {/* Variants Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <div>
              <h2 className="text-xl font-black text-gray-800">Product Variants</h2>
              <p className="text-xs text-gray-400">Configure size packages, pricing, SKUs, and images for each specific product option.</p>
            </div>
            <Button 
              type="button"
              variant="outline"
              onClick={addVariant}
              className="!rounded-2xl border-green-200 text-green-600 hover:bg-green-50/50 font-bold"
              icon="lucide:plus"
            >
              Add Variant Option
            </Button>
          </div>

          <div className="space-y-6">
            {formData.variants.map((variant, index) => (
              <Card key={index} className="!p-8 border-gray-100 shadow-sm relative group animate-in slide-in-from-bottom duration-300 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-50 text-green-600 text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    Variant Configuration
                  </h3>
                  {formData.variants.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 bg-red-50 hover:bg-red-100/70 px-3 py-1.5 rounded-xl"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  )}
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Size/Weight Value</label>
                    <input 
                      type="number" 
                      value={variant.value}
                      required
                      onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-semibold text-xs" 
                      placeholder="e.g. 50, 100, 1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Measurement Unit</label>
                    <select 
                      value={variant.unit}
                      required
                      onChange={(e) => handleVariantChange(index, 'unit', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-xs cursor-pointer"
                    >
                      <option value="">Select Unit</option>
                      {units.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.shortName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input 
                      type="number" 
                      value={variant.price}
                      required
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-semibold text-xs" 
                      placeholder="e.g. 299"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Stock Qty</label>
                    <input 
                      type="number" 
                      value={variant.stock}
                      required
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-semibold text-xs" 
                      placeholder="e.g. 50"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Variant SKU</label>
                    <input 
                      type="text" 
                      value={variant.sku}
                      required
                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-semibold text-xs uppercase" 
                      placeholder="Unique SKU"
                    />
                  </div>
                </div>

                {/* Variant-Specific Premium Image Upload Manager */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm/50">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-gray-700 tracking-wide uppercase">Variant Gallery Images</h4>
                    <p className="text-[10px] text-gray-400">Add photos specific to this package option (Required).</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Drag-Drop Upload Area */}
                    <div className="border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50/20 rounded-2xl p-6 text-center transition-all relative cursor-pointer group flex flex-col items-center justify-center min-h-[140px]">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={(e) => handleVariantFileUpload(index, e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingIndex !== null}
                      />
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-xs font-bold text-gray-700 mt-2">Upload Files</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">Drag photos or click to browse</p>
                    </div>

                    {/* Previews */}
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      {variant.images && variant.images.map((url, imgIndex) => {
                        const displayUrl = url.startsWith('http') 
                          ? url 
                          : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dummy'}/image/upload/${url}`;

                        return (
                          <div key={imgIndex} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex-shrink-0">
                            <img src={displayUrl} alt="Variant" className="w-full h-full object-cover" />
                            
                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5">
                              {/* Left */}
                              <button 
                                type="button" 
                                disabled={imgIndex === 0}
                                onClick={() => moveVariantImage(index, imgIndex, 'left')} 
                                className="p-1 bg-white rounded-md text-gray-700 hover:text-green-600 disabled:opacity-30 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                              </button>
                              
                              {/* Delete */}
                              <button 
                                type="button" 
                                onClick={() => removeVariantImage(index, imgIndex)} 
                                className="p-1 bg-white rounded-md text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>

                              {/* Right */}
                              <button 
                                type="button" 
                                disabled={imgIndex === variant.images.length - 1}
                                onClick={() => moveVariantImage(index, imgIndex, 'right')} 
                                className="p-1 bg-white rounded-md text-gray-700 hover:text-green-600 disabled:opacity-30 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                              </button>
                            </div>
                            <span className="absolute top-1 left-1 px-1 py-0.5 bg-black/60 text-white text-[8px] font-black rounded-md">{imgIndex === 0 ? 'MAIN' : imgIndex + 1}</span>
                          </div>
                        );
                      })}
                      {(!variant.images || variant.images.length === 0) && (
                        <div className="w-full h-[140px] flex items-center justify-center border border-dashed border-gray-100 rounded-2xl text-xs font-bold text-gray-400 bg-gray-50/50">
                          No images uploaded yet. Upload at least one.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Initial Warehouse Inventory Details */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleVariantChange(index, 'showInventory', !variant.showInventory)}
                    className="text-xs font-extrabold text-green-600 hover:text-green-700 transition-colors flex items-center gap-1 ml-1"
                  >
                    <svg className={`w-3.5 h-3.5 transform transition-transform ${variant.showInventory ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    {variant.showInventory ? 'Hide Initial Inventory Details' : 'Configure Initial Inventory Details (Optional)'}
                  </button>

                  {variant.showInventory && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-5 bg-green-50/20 border border-green-100/50 rounded-2xl animate-in slide-in-from-top duration-300">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Batch Number</label>
                        <input 
                          type="text" 
                          value={variant.batchNumber}
                          onChange={(e) => handleVariantChange(index, 'batchNumber', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-xs font-semibold" 
                          placeholder="e.g. BATCH-01A (Auto generated)"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Mfg Date</label>
                        <input 
                          type="date" 
                          value={variant.mfgDate}
                          onChange={(e) => handleVariantChange(index, 'mfgDate', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-xs font-semibold" 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Expiry Date</label>
                        <input 
                          type="date" 
                          value={variant.expiryDate}
                          onChange={(e) => handleVariantChange(index, 'expiryDate', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-xs font-semibold" 
                        />
                      </div>

                      <div className="md:col-span-3 space-y-1.5">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Inventory Notes</label>
                        <input 
                          type="text" 
                          value={variant.notes}
                          onChange={(e) => handleVariantChange(index, 'notes', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-xs font-semibold" 
                          placeholder="Initial batch arrival details..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Certificates & Packaging */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="!p-8 border-gray-100 shadow-sm flex flex-col justify-center min-h-[160px]">
                <MultiSelectDropdown 
                   label="Product Certificates"
                   options={certificateOptions.map(c => ({ id: c._id, label: c.name, image: c.url }))}
                   selectedValues={formData.certificates}
                   onChange={(id) => toggleFeature(id, 'certificates')}
                   placeholder="Select certificates"
                />
            </Card>

            <Card className="!p-8 border-gray-100 shadow-sm flex flex-col justify-center min-h-[160px]">
                <MultiSelectDropdown 
                   label="Packaging Types"
                   options={packagingOptions.map(p => ({ id: p._id, label: p.name, subLabel: p.type }))}
                   selectedValues={formData.packaging}
                   onChange={(id) => toggleFeature(id, 'packaging')}
                   placeholder="Select packaging"
                />
            </Card>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 border-t border-gray-100 pt-6">
          <Button 
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="!rounded-2xl px-8 font-bold"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="edit"
            isLoading={loading}
            icon="lucide:save"
            className="!rounded-2xl px-10 shadow-lg font-bold"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
