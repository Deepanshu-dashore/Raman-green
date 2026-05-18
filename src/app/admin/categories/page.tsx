"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/shared/PageHeader';
import DeleteModal from '@/components/shared/DeleteModal';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent: '',
    description: '',
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/categories')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          // Sort categories: parent first, then its children
          const sorted = [...json.data].sort((a, b) => {
            const parentA = a.parent?._id || a._id;
            const parentB = b.parent?._id || b._id;
            
            if (parentA === parentB) {
              // Same parent or both are roots, put root first
              if (!a.parent) return -1;
              if (!b.parent) return 1;
              return a.name.localeCompare(b.name);
            }
            return parentA.localeCompare(parentB);
          });
          setCategories(sorted);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name if editing name
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') } : {})
    }));
  };

  const handleAddSubcategory = (parentId: string) => {
    setFormData(prev => ({ ...prev, parent: parentId }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus the name input
    const nameInput = document.getElementsByName('name')[0];
    if (nameInput) nameInput.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parent: formData.parent || undefined // Don't send empty string
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Category created successfully!");
        setFormData({ name: '', slug: '', parent: '', description: '', image: '' });
        fetchCategories(); // Refresh list
      } else {
        toast.error("Error: " + json.message);
      }
    } catch (err: any) {
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (category: any) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    const catId = selectedCategory._id;
    setDeleteModalOpen(false);
    try {
      const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Error deleting category.");
    } finally {
      setSelectedCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Categories"
        description="Organize your products into hierarchies."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Categories' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category List */}
        <div className="lg:col-span-2">
          <DataTable 
            data={categories}
            loading={loading}
            rowKey={(cat) => cat._id}
            columns={[
              {
                key: 'name',
                label: 'Name',
                sortable: true,
                custom: true,
                render: (cat) => (
                  <div className="flex items-center">
                    {cat.parent && (
                      <span className="text-gray-300 mr-2">
                        <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                      </span>
                    )}
                    <span className={cat.parent ? 'text-gray-600 font-medium ml-4' : 'text-gray-900 font-bold'}>
                      {cat.name}
                    </span>
                  </div>
                )
              },
              {
                key: 'slug',
                label: 'Slug',
                type: 'text',
                sortable: true
              },
              {
                key: 'parent',
                label: 'Parent',
                custom: true,
                render: (cat) => cat.parent ? (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                    {cat.parent.name}
                  </span>
                ) : (
                  <span className="text-gray-300">Root</span>
                )
              }
            ]}
            onDelete={handleDeleteClick}
            additionalActions={[
              {
                label: 'Add Subcategory',
                icon: PlusIcon,
                disabled: (cat) => !!cat.parent,
                onClick: (cat) => handleAddSubcategory(cat._id)
              }
            ]}
            hiddenActions={['view', 'edit']}
          />
        </div>

        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-4">Add New Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                placeholder="e.g. Microgreens" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Slug</label>
              <input 
                type="text" 
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                placeholder="slug-url" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Parent Category</label>
              <select 
                name="parent"
                value={formData.parent}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="">None</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description (Optional)</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[100px]" 
                placeholder="Brief description..." 
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className={`w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all mt-2 flex items-center justify-center space-x-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              ) : (
                <span>Create Category</span>
              )}
            </button>
          </form>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete category "${selectedCategory?.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default AdminCategories;
