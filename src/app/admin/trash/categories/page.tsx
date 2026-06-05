"use client";

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';

export default function CategoriesTrashPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrashCategories = () => {
    setLoading(true);
    fetch('/api/categories/trash')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setCategories(json.data);
        } else {
          toast.error(json.message || "Failed to load trash categories.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Error fetching categories from trash.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrashCategories();
  }, []);

  const handleRestoreClick = (category: any) => {
    toast.promise(
      fetch(`/api/categories/restore/${category._id}`, { method: 'PUT' })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setCategories(prev => prev.filter(item => item._id !== category._id));
            return json;
          } else {
            throw new Error(json.message);
          }
        }),
      {
        loading: 'Restoring category...',
        success: 'Category restored successfully',
        error: (err) => err.message || 'Failed to restore category'
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Categories Trash"
        description="View and restore soft-deleted product categories."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Trash', href: '/admin/trash/products' },
          { label: 'Categories' }
        ]}
      />

      {/* Table */}
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
            key: 'deletedAt',
            label: 'Deleted At',
            type: 'date',
            sortable: true,
            getDate: (cat) => cat.deletedAt || new Date()
          }
        ]}
        hiddenActions={['view', 'edit', 'delete']}
        additionalActions={[
          {
            label: 'Restore',
            icon: 'solar:square-arrow-left-bold-duotone',
            onClick: handleRestoreClick
          }
        ]}
      />
    </div>
  );
}
