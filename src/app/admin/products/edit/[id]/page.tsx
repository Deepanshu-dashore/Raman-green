"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown';
import { PageHeader } from '@/components/shared/PageHeader';
import Card from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Icon } from '@iconify/react';

interface EditProductProps {
  params: Promise<{ id: string }>;
}

const EditProduct = ({ params }: EditProductProps) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const [categories, setCategories] = useState<any[]>([]);
  const [certificateOptions, setCertificateOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    brand: 'Raman Green',
    isFeatured: false,
    certificates: [] as string[]
  });

  const [existingVariants, setExistingVariants] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/admin/certificates').then(res => res.json()),
    ]).then(([cat, cert]) => {
      if (cat.success) setCategories(cat.data);
      if (cert.success) setCertificateOptions(cert.data);
      
      return fetch(`/api/products/${productId}`).then(res => res.json());
    }).then((prodJson) => {
      if (prodJson && prodJson.success && prodJson.data) {
        const prod = prodJson.data;
        
        setExistingVariants(prod.variants || []);
        
        setFormData({
          name: prod.name || '',
          slug: prod.slug || '',
          description: prod.description || '',
          category: prod.category?._id || prod.category || '',
          brand: prod.brand || 'Raman Green',
          isFeatured: !!prod.isFeatured,
          certificates: (prod.certificates || []).map((c: any) => c._id || c)
        });
      } else {
        toast.error("Product not found");
      }
    })
    .catch(() => {
      toast.error("Failed to load product details");
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

  const toggleCertificate = (id: string) => {
    setFormData(prev => {
      const list = [...prev.certificates];
      const index = list.indexOf(id);
      if (index > -1) list.splice(index, 1);
      else list.push(id);
      return { ...prev, certificates: list };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Base Product updated successfully!");
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
        title="Edit Base Product"
        description="Modify metadata, brands, and categories. Click 'Manage Variants' to configure specific product options."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'Edit Base Product' }
        ]}
        backLink="/admin/products"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Base Info Editing Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
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
                  placeholder="Write detailed product descriptions..."
                />
              </div>

              <div className="flex items-center space-x-3 mt-2 col-span-2">
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

          {/* Certificates */}
          <Card className="!p-8 border-gray-100 shadow-sm flex flex-col justify-center min-h-[160px]">
              <MultiSelectDropdown 
                 label="Product Certificates"
                 options={certificateOptions.map(c => ({ id: c._id, label: c.name, image: c.url }))}
                 selectedValues={formData.certificates}
                 onChange={toggleCertificate}
                 placeholder="Select certificates"
              />
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
              className="!rounded-2xl px-8 font-bold"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              isLoading={loading}
              icon="lucide:save"
              className="!rounded-2xl px-10 shadow-lg font-bold"
            >
              Save Product Details
            </Button>
          </div>
        </form>

        {/* Variants Summary & Action Manager */}
        <div className="space-y-6">
          <Card className="!p-6 border-green-100 bg-green-50/10 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-800">Variants Manager</h3>
                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase">
                  {existingVariants.length} Active
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Define and manage weight packages, stock levels, specific pricing, images, and packaging parameters for this product in a dedicated manager.
              </p>
            </div>

            <Button 
              onClick={() => router.push(`/admin/products/edit/${productId}/variants`)}
              className="w-full !rounded-2xl !py-3.5 font-bold shadow-lg shadow-green-100 mt-4 bg-green-600 hover:bg-green-700"
              icon="solar:clipboard-list-bold-duotone"
            >
              Manage & Add Variants
            </Button>
          </Card>

          {/* Variants quick look list */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Variant Options Quick-Look</h4>
            
            {existingVariants.map((v, index) => (
              <div key={v._id || index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {v.images?.[0] ? (
                      <img src={v.images[0]} alt="Variant" className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="lucide:box" className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-800">
                      {v.weight || v.value || ''} {v.unit?.shortName || v.unit?.name || ''}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wide">
                      SKU: {v.sku || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-gray-900">₹{v.basePrice || v.price}</p>
                  <p className="text-[10px] text-green-600 font-bold mt-0.5">{v.stock} in Stock</p>
                </div>
              </div>
            ))}

            {existingVariants.length === 0 && (
              <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl text-xs font-semibold text-gray-400 bg-gray-50/50">
                No variant sizes configured. Add one now!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
