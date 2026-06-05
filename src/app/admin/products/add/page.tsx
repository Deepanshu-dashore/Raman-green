"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown';
import { PageHeader } from '@/components/shared/PageHeader';
import Card from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import LabledInput from '@/components/shared/LabledInput';

const AddProduct = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [certificateOptions, setCertificateOptions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    cultivation: '',
    cultivation_city: [] as string[],
    brand: 'Raman Green',
    isFeatured: false,
    certificates: [] as string[]
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/admin/certificates').then(res => res.json()),
      fetch('/api/admin/cities').then(res => res.json()),
    ]).then(([cat, cert, cit]) => {
      if (cat.success) setCategories(cat.data);
      if (cert.success) setCertificateOptions(cert.data);
      if (cit.success) setCities(cit.data);
    }).catch(() => toast.error("Failed to load category/certificate/city parameters"));
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

  const toggleCertificate = (id: string) => {
    setFormData(prev => {
      const list = [...prev.certificates];
      const index = list.indexOf(id);
      if (index > -1) list.splice(index, 1);
      else list.push(id);
      return { ...prev, certificates: list };
    });
  };

  const toggleCity = (id: string) => {
    setFormData(prev => {
      const list = [...prev.cultivation_city];
      const index = list.indexOf(id);
      if (index > -1) list.splice(index, 1);
      else list.push(id);
      return { ...prev, cultivation_city: list };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Base Product created successfully! You can now manage its variants.");
        // Redirect to edit page so they can immediately see details and add variants!
        router.push(`/admin/products/edit/${json.data._id}`);
      } else {
        toast.error(json.message || "Failed to create product");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 px-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Add Base Product"
        description="Enter product metadata, brand, and certificates first. Variants are configured separately."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'Add Base Product' }
        ]}
        backLink="/admin/products"
      />

      <form onSubmit={handleSubmit} className="space-y-8 mt-6">
        {/* Basic Info */}
        <Card className="!p-8 border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold border-b border-gray-100 pb-4 text-gray-800">Product Metadata</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabledInput
              label="Product Name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Organic Broccoli Microgreens"
              className="col-span-2"
            />

            <LabledInput
              label="Slug (URL)"
              name="slug"
              required
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="slug-url"
            />

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

            <LabledInput
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="Brand name"
            />

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cultivation Type</label>
              <select 
                name="cultivation"
                required
                value={formData.cultivation}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm cursor-pointer"
              >
                <option value="">Select Cultivation</option>
                <option value="Organic">Organic</option>
                <option value="Natural">Natural</option>
                <option value="Hydroponic">Hydroponic</option>
                <option value="Aquaponic">Aquaponic</option>
                <option value="Polyhouse">Polyhouse</option>
                <option value="Open Field">Open Field</option>
                <option value="Soil-less">Soil-less</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col justify-center min-h-[80px]">
              <MultiSelectDropdown 
                 label="Cultivation Cities"
                 options={cities.map(c => ({ id: c._id, label: `${c.name} (${c.state || ''})` }))}
                 selectedValues={formData.cultivation_city}
                 onChange={toggleCity}
                 placeholder="Select cities"
              />
            </div>

            <LabledInput
              label="Product Description"
              type="textarea"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Write detailed product descriptions, highlights, nutritional value..."
              className="col-span-2"
            />

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

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 border-t border-gray-100 pt-6">
          <Button 
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
            className="!py-2 !px-4 !rounded-lg text-xs font-bold"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            isLoading={loading}
            icon="lucide:check"
            className="!py-2.5 !px-6 !rounded-lg text-xs font-bold"
          >
            Create Base Product
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
