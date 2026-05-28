"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import Card from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface InventoryItem {
  _id: string;
  variantId: {
    _id: string;
    sku: string;
    weight: number;
    size: number;
    value: number;
    basePrice: number;
    images?: string[];
    unit?: {
      _id: string;
      name: string;
      shortName: string;
    };
  };
  productId: {
    _id: string;
    name: string;
    brand: string;
  };
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  availableQty: number;
  reservedQty: number;
  lowStockLimit: number;
  notes: string;
}

interface HistoryItem {
  _id: string;
  actionType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdAt: string;
  referenceModel: string;
}

interface InventoryViewPageProps {
  params: Promise<{ id: string }>;
}

const InventoryViewPage = ({ params }: InventoryViewPageProps) => {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const inventoryId = resolvedParams.id;

  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/inventory/${inventoryId}`).then((res) => res.json()),
      fetch(`/api/inventory/${inventoryId}/history`).then((res) => res.json()),
    ])
      .then(([invRes, histRes]) => {
        if (invRes.success) setInventory(invRes.data);
        else toast.error(invRes.message || "Failed to load batch details.");

        if (histRes.success) setHistory(histRes.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("An error occurred while fetching details.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [inventoryId]);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "STOCK_IN":
        return "bg-green-50 text-green-700 border-green-100";
      case "SALE":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "RETURN":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "MANUAL_UPDATE":
        return "bg-slate-50 text-slate-700 border-slate-200/60";
      case "DAMAGED":
        return "bg-red-50 text-red-700 border-red-100";
      case "EXPIRY":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "STOCK_IN":
        return "lucide:arrow-down-left";
      case "SALE":
        return "lucide:shopping-bag";
      case "RETURN":
        return "lucide:rotate-ccw";
      case "MANUAL_UPDATE":
        return "lucide:sliders";
      case "DAMAGED":
        return "lucide:skull";
      case "EXPIRY":
        return "lucide:calendar-x";
      default:
        return "lucide:history";
    }
  };

  const getStockStatus = (qty: number, limit = 10) => {
    if (qty === 0) return "outOfStock";
    if (qty <= limit) return "lowStock";
    return "inStock";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600" />
        <p className="text-sm font-semibold text-gray-500">Loading batch details...</p>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
          <Icon icon="lucide:alert-circle" className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Batch Record Not Found</h2>
        <p className="text-sm text-gray-500">
          The requested warehouse inventory record might have been removed or deleted.
        </p>
        <Button onClick={() => router.push("/admin/inventory")} icon="lucide:arrow-left">
          Back to Inventory
        </Button>
      </div>
    );
  }

  const activeImage = inventory.variantId?.images?.[0] || null;

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 animate-in fade-in duration-500 space-y-6">
      <PageHeader
        title={`Batch details: ${inventory.batchNumber}`}
        description={`Variant SKU: ${inventory.variantId?.sku || 'N/A'}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: "/admin/inventory" },
          { label: inventory.batchNumber },
        ]}
        backLink="/admin/inventory"
        actionNode={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/products/${inventory.productId?._id}`)}
              icon="lucide:eye"
              className="!rounded-xl"
            >
              View Base Product
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Timeline stock history */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="!p-6 border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <span className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center border border-green-100 shrink-0">
                <Icon icon="lucide:history" className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-gray-800 tracking-tight">Stock log timeline</h3>
                <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Chronological warehouse entry adjustments</p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400">
                  <Icon icon="lucide:calendar-minus" className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-600">No log entries recorded</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">No transaction adjustments have been logged for this stock batch yet.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 pl-6 ml-3 py-2 space-y-8">
                {history.map((log) => {
                  const date = new Date(log.createdAt).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div key={log._id} className="relative group">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm shrink-0 z-10 transition-transform group-hover:scale-110 ${getActionBadgeColor(log.actionType)}`}>
                        <Icon icon={getActionIcon(log.actionType)} className="w-3 h-3" />
                      </span>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-black uppercase tracking-wider text-gray-800 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-lg">
                              {log.actionType.replace("_", " ")}
                            </span>
                            <span className="text-xs text-gray-400 font-semibold">{date}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[12px] font-bold">
                            <span className="text-gray-400 font-semibold">Stock progression:</span>
                            <span className="text-gray-500 font-black">{log.previousStock}</span>
                            <Icon icon="lucide:arrow-right" className="w-3 h-3 text-gray-400" />
                            <span className="text-green-600 font-black">{log.newStock}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 font-semibold leading-relaxed pl-1">{log.note}</p>

                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                          Diff adjustment: <span className={log.newStock >= log.previousStock ? "text-green-600 font-black" : "text-red-500 font-black"}>
                            {log.newStock >= log.previousStock ? `+${log.quantity}` : `-${log.quantity}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Section: Batch Parameters & Information */}
        <div className="space-y-6">
          {/* Card 1: Batch stock card */}
          <Card className="!p-6 border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              {activeImage ? (
                <img
                  src={activeImage.startsWith("http") ? activeImage : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${activeImage}`}
                  alt={inventory.productId?.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-gray-100 bg-gray-50"
                />
              ) : (
                <span className="w-14 h-14 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center border border-green-100 shrink-0">
                  <Icon icon="lucide:package" className="w-6 h-6" />
                </span>
              )}

              <div>
                <h4 className="text-sm font-black text-gray-800 line-clamp-1">{inventory.productId?.name}</h4>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                  SKU: {inventory.variantId?.sku}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available Qty</span>
                <span className="text-2xl font-black text-gray-800">{inventory.availableQty}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reserved Qty</span>
                <span className="text-2xl font-black text-gray-400">{inventory.reservedQty}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock Status</span>
                <span className="inline-block mt-0.5">
                  <StatusBadge status={getStockStatus(inventory.availableQty, inventory.lowStockLimit)} size="xs" />
                </span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Limit Alert</span>
                <span className="text-sm font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg inline-block mt-0.5">
                  {inventory.lowStockLimit ?? 10} Units
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Batch specifications details */}
          <Card className="!p-6 border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shrink-0">
                <Icon icon="lucide:clipboard-list" className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-gray-800 tracking-tight">Batch parameters</h3>
                <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Warehouse tracking parameters</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <span className="text-gray-400">Batch Number</span>
                <span className="text-gray-800 font-bold bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-md">
                  {inventory.batchNumber}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <span className="text-gray-400">Mfg Date</span>
                <span className="text-gray-800 font-bold">
                  {inventory.mfgDate ? new Date(inventory.mfgDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <span className="text-gray-400">Expiry Date</span>
                <span className={`font-bold ${inventory.expiryDate && new Date(inventory.expiryDate).getTime() < Date.now() ? "text-red-500 font-black" : "text-gray-800"}`}>
                  {inventory.expiryDate ? new Date(inventory.expiryDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "N/A"}
                </span>
              </div>

              {inventory.notes && (
                <div className="pt-2">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch remarks</span>
                  <div className="p-3 bg-gray-50/70 border border-gray-100/60 rounded-xl text-xs font-semibold text-gray-500 leading-relaxed">
                    {inventory.notes}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Card 3: Variant Specifications Card */}
          <Card className="!p-6 border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                <Icon icon="lucide:sliders" className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-gray-800 tracking-tight">Variant specifications</h3>
                <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Physical & commercial properties</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <span className="text-gray-400">Variant SKU</span>
                <span className="text-gray-800 font-bold bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-md uppercase">
                  {inventory.variantId?.sku || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <span className="text-gray-400">Base Unit Price</span>
                <span className="text-gray-800 font-bold">₹{inventory.variantId?.basePrice}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <span className="text-gray-400">Size / Weight</span>
                <span className="text-gray-800 font-bold">
                  {inventory.variantId?.weight || inventory.variantId?.size || 0} {inventory.variantId?.unit?.shortName || ""}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <span className="text-gray-400">Unit Type</span>
                <span className="text-gray-800 font-bold">
                  {inventory.variantId?.unit?.name || "N/A"} ({inventory.variantId?.unit?.shortName || "N/A"})
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryViewPage;
