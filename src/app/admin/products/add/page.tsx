"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AddProduct = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    basePrice: '',
    description: '',
    brand: '',
    isFeatured: false,
    images: [''],
    variants: [{ weight: '', price: '', stock: '', sku: '' }]
  });

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(json => {
        if (json.success) setCategories(json.data);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as any).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val,
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') } : {})
    }));
  };

  const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newVariants = [...formData.variants];
    (newVariants[index] as any)[name] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { weight: '', price: '', stock: '', sku: '' }]
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length === 1) return;
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          basePrice: Number(formData.basePrice),
          variants: formData.variants.map(v => ({
            ...v,
            price: Number(v.price),
            stock: Number(v.stock)
          }))
        })
      });
      const json = await res.json();
      if (json.success) {
        alert("Product added successfully!");
        router.push('/admin/products');
      } else {
        alert("Error: " + json.message);
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b border-gray-50 pb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="e.g. Premium Broccoli Microgreens" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Base Price (₹)</label>
              <input type="number" name="basePrice" value={formData.basePrice} onChange={handleInputChange} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="299" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Brand (Optional)</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="Raman Green" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none min-h-[120px]" placeholder="Detailed product description..." />
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} id="isFeatured" className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Mark as Featured Product</label>
          </div>
        </div>

        {/* Variants Card */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h3 className="font-bold text-lg">Product Variants</h3>
            <button type="button" onClick={addVariant} className="text-sm text-green-600 font-bold hover:underline">+ Add Variant</button>
          </div>
          <div className="space-y-4">
            {formData.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl relative group">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Weight</label>
                  <input type="text" name="weight" value={v.weight} onChange={(e) => handleVariantChange(i, e)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md outline-none text-sm" placeholder="100g" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price</label>
                  <input type="number" name="price" value={v.price} onChange={(e) => handleVariantChange(i, e)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md outline-none text-sm" placeholder="₹" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Stock</label>
                  <input type="number" name="stock" value={v.stock} onChange={(e) => handleVariantChange(i, e)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md outline-none text-sm" />
                </div>
                <div className="md:col-span-2 flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">SKU</label>
                    <input type="text" name="sku" value={v.sku} onChange={(e) => handleVariantChange(i, e)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md outline-none text-sm" />
                  </div>
                  {formData.variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images Card */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h3 className="font-bold text-lg">Product Images</h3>
            <button type="button" onClick={addImageField} className="text-sm text-green-600 font-bold hover:underline">+ Add Image URL</button>
          </div>
          <div className="space-y-3">
            {formData.images.map((url, i) => (
              <div key={i}>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Image URL {i + 1}</label>
                <input type="text" value={url} onChange={(e) => handleImageChange(i, e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="https://example.com/image.jpg" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button type="button" onClick={() => router.back()} className="flex-1 bg-white border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">Cancel</button>
          <button type="submit" disabled={loading} className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all disabled:opacity-70 flex items-center justify-center space-x-2">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : <span>Save Product</span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
