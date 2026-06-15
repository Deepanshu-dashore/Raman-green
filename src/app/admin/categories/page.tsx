"use client";

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/shared/DataTable';
import { PlusIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/shared/Button';
import DeleteModal from '@/components/shared/DeleteModal';
import { CategoryCreateModal } from '@/components/admin/CategoryCreateModal';
import { CategoryViewModal } from '@/components/admin/CategoryViewModal';
import { Icon } from '@iconify/react';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [defaultParent, setDefaultParent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState<any | null>(null);

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/categories')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const sorted = [...json.data].sort((a, b) => {
            const parentA = a.parent?._id || a._id;
            const parentB = b.parent?._id || b._id;

            if (parentA === parentB) {
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

  const openCreateModal = (parentId = '') => {
    setDefaultParent(parentId);
    setCreateModalOpen(true);
  };

  const handleAddSubcategory = (parentId: string) => {
    openCreateModal(parentId);
  };

  const handleEditClick = (category: any) => {
    setSelectedCategory(category);
    setCreateModalOpen(true);
  };

  const handleDeleteClick = (category: any) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleViewClick = (category: any) => {
    setCategoryToView(category);
    setViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    const catId = selectedCategory._id;
    setDeleteModalOpen(false);
    try {
      const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success("Category moved to trash");
        fetchCategories();
      } else {
        toast.error(json.message);
      }
    } catch {
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
      <PageHeader
        title="Categories"
        description="Organize your products into hierarchies."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Categories' }
        ]}
        actionNode={
          <Button onClick={() => openCreateModal()} icon="lucide:plus">
            Add Category
          </Button>
        }
      />

      <DataTable
        data={categories.filter(cat => !cat.parent)}
        loading={loading}
        rowKey={(cat) => cat._id}
        columns={[
          {
            key: 'name',
            label: 'Name',
            type: 'user',
            sortable: true,
            getAvatar: (cat) => cat.image || cat.name?.charAt(0) || '?',
            getTitle: (cat) => cat.name,
            getSubtitle: (cat) => cat.parent ? `Sub of ${cat.parent.name}` : 'Root category',
          },
          {
            key: 'slug',
            label: 'Slug',
            type: 'text',
            sortable: true
          },
          {
            key: 'subcategories',
            label: 'Subcategories',
            custom: true,
            render: (cat) => {
              const count = categories.filter(c => c.parent?._id === cat._id || c.parent === cat._id).length;
              return (
                <span className="bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-xl text-xs">
                  {count} {count === 1 ? 'subcategory' : 'subcategories'}
                </span>
              );
            }
          }
        ]}
        onView={handleViewClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        additionalActions={[
          {
            label: 'Add Subcategory',
            icon: PlusIcon,
            disabled: (cat) => !!cat.parent,
            onClick: (cat) => handleAddSubcategory(cat._id)
          }
        ]}
        hiddenActions={[]}
        renderRowDetails={(parentCat) => {
          const subcats = categories.filter(cat => cat.parent?._id === parentCat._id || cat.parent === parentCat._id);
          if (subcats.length === 0) {
            return <p className="text-xs text-gray-400 italic px-2 py-1">No subcategories defined.</p>;
          }
          return (
            <div className="pl-4 pr-2 py-3 flex flex-col gap-2.5 bg-gray-50/50 rounded-2xl border border-gray-200/40">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2.5">
                Subcategories ({subcats.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subcats.map((sub) => (
                  <div key={sub._id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="w-10 h-10 rounded-xl object-cover bg-gray-50 border border-gray-100 shadow-sm shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 font-extrabold flex items-center justify-center uppercase shadow-sm shrink-0">
                          {sub.name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-gray-900 leading-snug">{sub.name}</span>
                        <span className="text-[11px] text-gray-400 font-mono tracking-tight">{sub.slug}</span>
                        {sub.description && (
                          <span className="text-[12px] text-gray-500 font-medium line-clamp-1 mt-0.5 max-w-[200px] md:max-w-[300px]">
                            {sub.description}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleViewClick(sub)}
                        className="p-1.5 text-gray-400 hover:text-gray-955 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="View Subcategory"
                      >
                        <Icon icon="lucide:eye" className="w-[17px] h-[17px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditClick(sub)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Subcategory"
                      >
                        <Icon icon="lucide:pencil" className="w-[17px] h-[17px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(sub)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Subcategory"
                      >
                        <Icon icon="lucide:trash" className="w-[17px] h-[17px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }}
      />

      <CategoryViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setCategoryToView(null);
        }}
        category={categoryToView}
        categories={categories}
      />

      <CategoryCreateModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setDefaultParent('');
          setSelectedCategory(null);
        }}
        categories={categories}
        defaultParent={defaultParent}
        categoryToEdit={selectedCategory}
        onSuccess={fetchCategories}
      />

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
