# Replace Quick‑Look Variant List with DataTable

## Goal
Swap the manual variant preview (the JSX block from lines 290‑314 in `src/app/admin/products/edit/[id]/page.tsx`) for the reusable **DataTable** component. This provides a consistent, sortable, paginated, searchable table view across the admin UI, aligning with the user’s request to "use table format, use DataTable".

## User Review Required
- Confirm the columns you want displayed for each variant (image, SKU, size, price, stock, packaging, etc.).
- Let us know if any row actions (edit/delete) are needed.
- Should the table include a checkbox column for bulk actions? (default = no)

## Open Questions
- Do you prefer the table to be dense (compact) by default? (default = false)
- Any additional filters or export buttons to be added to the table toolbar?

## Proposed Changes
---
### 1. Define variant columns
Add a `variantColumns` constant near the top of `edit/[id]/page.tsx`:
```tsx
const variantColumns: ColumnDef<any>[] = [
  {
    key: 'image',
    label: 'Variant',
    type: 'user',
    getAvatar: (v) => v.images?.[0] || v.sku?.charAt(0) || '?',
    getTitle: (v) => v.sku,
    getSubtitle: (v) =>
      `${v.weight || v.value || ''} ${v.unit?.shortName || v.unit?.name || ''}`.trim(),
  },
  {
    key: 'price',
    label: 'Price',
    custom: true,
    render: (v) => (
      <div className="text-sm">
        <span className="font-bold text-gray-900">₹{v.basePrice ?? v.price}</span>
        {v.discountedPrice && (
          <span className="block text-xs font-medium text-green-600">₹{v.discountedPrice} sale</span>
        )}
      </div>
    ),
  },
  {
    key: 'stock',
    label: 'Stock',
    custom: true,
    render: (v) => {
      const stock = Number(v.stock) || 0;
      const styleKey = stock === 0 ? 'outOfStock' : stock < 15 ? 'lowStock' : 'inStock';
      const style = getStatusStyle(styleKey);
      return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${style.color}`}>
          {stock === 0 ? 'Out of stock' : stock < 15 ? `Low (${stock})` : `In stock (${stock})`}
        </span>
      );
    },
  },
  {
    key: 'packaging',
    label: 'Packaging',
    custom: true,
    render: (v) =>
      v.packaging?.length ? (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {v.packaging.map((p) => (
            <span
              key={p._id}
              className="text-[9px] font-bold uppercase text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded"
            >
              {p.name}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-gray-400">—</span>
      ),
  },
];
```

### 2. Insert DataTable component
Replace the block between lines 290‑314 (the manual `existingVariants.map`) with:
```tsx
<DataTable
  data={existingVariants}
  columns={variantColumns}
  rowKey={(v) => v._id || v.sku}
  loading={false}
  showCheckBox={false}
  hiddenActions={["view"]} // hide default view action
  additionalActions={[]}
  onEdit={/* optional edit handler */}
  onDelete={/* optional delete handler */}
/>
```
If you later need edit/delete actions, define `handleEditVariant` / `handleDeleteVariant` and pass them via `onEdit` / `onDelete`.

### 3. Remove old JSX
Delete lines 290‑314 (the entire `existingVariants.map` block) and the surrounding empty‑state markup (lines 315‑320). The new DataTable already handles empty states.
---

## Verification Plan
1. Run `pnpm dev` and navigate to the product edit page.
2. Confirm the variants table appears, columns render correctly, and sorting works.
3. Ensure no React "key" warnings are logged.
4. Verify the empty‑state message shows when `existingVariants` is empty.
5. (Optional) Test any edit/delete handlers you add.

---
