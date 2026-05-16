"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown';
import { PageHeader } from '@/components/shared/PageHeader';

const AddProduct = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<any[]>([]);
  const [certificateOptions, setCertificateOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    basePrice: '',
    brand: 'Raman Green',
    isFeatured: false,
    images: [''],
    variants: [
      { value: '', unit: '', price: '', stock: '', sku: '' }
    ],
    certificates: [] as string[],
    packaging: [] as string[]
  });

  useEffect(() => {
    // Parallel fetching
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
    }).catch(() => toast.error("Failed to load options"));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val,
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') } : {})
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
    }
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...formData.variants];
    (newVariants[index] as any)[field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { value: '', unit: '', price: '', stock: '', sku: '' }]
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: newVariants });
    }
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
      // Clean up data
      const payload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        images: formData.images.filter(img => img.trim() !== ''),
        variants: formData.variants.map(v => ({
          ...v,
          value: Number(v.value),
          price: Number(v.price),
          stock: Number(v.stock)
        }))
      };

      if (payload.images.length === 0) {
        toast.error("At least one image URL is required");
        setLoading(false);
        return;
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Product added successfully!");
        router.push('/admin/products');
      } else {
        toast.error(json.message || "Failed to add product");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader 
        title="Add New Product"
        description="Create a new entry in your store catalog."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'Add Product' }
        ]}
        backLink="/admin/products"
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold border-b border-gray-50 pb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Name</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                placeholder="e.g. Organic Broccoli Microgreens"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Slug (URL)</label>
              <input 
                type="text" 
                name="slug"
                required
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                placeholder="slug-url"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
              <select 
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Base Price (₹)</label>
              <input 
                type="number" 
                name="basePrice"
                required
                value={formData.basePrice}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brand</label>
              <input 
                type="text" 
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                placeholder="Brand name"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                placeholder="Detailed product description..."
              />
            </div>
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700">Mark as Featured Product</label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h2 className="text-xl font-bold">Product Images</h2>
            <button 
              type="button"
              onClick={addImageField}
              className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span>Add URL</span>
            </button>
          </div>
          <div className="space-y-4">
            {formData.images.map((url, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={url}
                    required
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {formData.images.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h2 className="text-xl font-bold">Price Variants & Stock</h2>
            <button 
              type="button"
              onClick={addVariant}
              className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span>Add Variant</span>
            </button>
          </div>
          
          <div className="space-y-6">
            {formData.variants.map((variant, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Value</label>
                    <input 
                      type="number" 
                      value={variant.value}
                      required
                      onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Unit</label>
                    <select 
                      value={variant.unit}
                      required
                      onChange={(e) => handleVariantChange(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                    >
                      <option value="">Select</option>
                      {units.map(u => (
                        <option key={u._id} value={u._id}>{u.shortName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Price (₹)</label>
                    <input 
                      type="number" 
                      value={variant.price}
                      required
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Stock</label>
                    <input 
                      type="number" 
                      value={variant.stock}
                      required
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">SKU</label>
                    <input 
                      type="text" 
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                      placeholder="Optional"
                    />
                  </div>
                </div>
                {formData.variants.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="absolute -top-3 -right-3 p-2 bg-white border border-gray-200 text-red-500 hover:text-red-600 rounded-full shadow-sm hover:shadow transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Certificates & Packaging */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-h-[160px]">
                <MultiSelectDropdown 
                   label="Product Certificates"
                   options={certificateOptions.map(c => ({ id: c._id, label: c.name, image: c.url }))}
                   selectedValues={formData.certificates}
                   onChange={(id) => toggleFeature(id, 'certificates')}
                   placeholder="Select certificates"
                />
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-h-[160px]">
                <MultiSelectDropdown 
                   label="Packaging Types"
                   options={packagingOptions.map(p => ({ id: p._id, label: p.name, subLabel: p.type }))}
                   selectedValues={formData.packaging}
                   onChange={(id) => toggleFeature(id, 'packaging')}
                   placeholder="Select packaging"
                />
            </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className={`bg-gray-900 text-white px-10 py-3 rounded-xl font-bold shadow-xl hover:bg-gray-800 transition-all flex items-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              <span>Publish Product</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
