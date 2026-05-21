"use client";

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/shared/DataTable';
import { PlusIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/shared/Button';
import DeleteModal from '@/components/shared/DeleteModal';
import { CategoryCreateModal } from '@/components/admin/CategoryCreateModal';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [defaultParent, setDefaultParent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

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
        data={categories}
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

      <CategoryCreateModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setDefaultParent('');
        }}
        categories={categories}
        defaultParent={defaultParent}
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
