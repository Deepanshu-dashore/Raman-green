"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { get } from "@/lib/axios";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    description?: string;
  };
  variant: {
    weight: string;
    price: number;
    sku: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  totalItems: number;
  paymentMethod: string;
  paymentStatus: string;
  trackingId?: string;
  status: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await get<Order[]>("/api/orders");
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED":
        return "bg-sky-50 border-sky-100 text-sky-700";
      case "CONFIRMED":
        return "bg-indigo-50 border-indigo-100 text-indigo-700";
      case "SHIPPED":
        return "bg-amber-50 border-amber-100 text-amber-700";
      case "DELIVERED":
        return "bg-green-50 border-green-100 text-green-700";
      case "CANCELLED":
        return "bg-rose-50 border-rose-100 text-rose-700";
      default:
        return "bg-gray-50 border-gray-100 text-gray-700";
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    if (status === "CANCELLED") {
      return { currentStep: -1, isCancelled: true };
    }
    const currentStep = steps.indexOf(status);
    return { currentStep, isCancelled: false };
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    return order.status === activeTab;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-playfair font-extrabold text-gray-900 leading-snug">
          My Orders
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Track active shipments, review past deliveries, and download invoices.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-100 gap-2 overflow-x-auto pb-px">
        {[
          { label: "All Orders", value: "ALL" },
          { label: "Placed", value: "PLACED" },
          { label: "Shipped", value: "SHIPPED" },
          { label: "Delivered", value: "DELIVERED" },
          { label: "Cancelled", value: "CANCELLED" },
        ].map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3.5 px-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? "border-[#47C269] text-forest"
                  : "border-transparent text-gray-400 hover:text-charcoal"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        /* Loading skeleton list */
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-gray-50 rounded-2xl border border-gray-100" />
          <div className="h-44 bg-gray-50 rounded-2xl border border-gray-100" />
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Premium Empty state */
        <div className="border border-dashed border-gray-200 rounded-3xl p-10 md:p-14 text-center max-w-xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-green-50/50 rounded-full flex items-center justify-center mb-4 border border-green-50">
            <Icon icon="solar:box-minimalistic-linear" className="w-8 h-8 text-[#3eac5c]" />
          </div>
          <h4 className="font-bold text-base text-gray-900 mb-1">No Orders Found</h4>
          <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed font-semibold">
            {activeTab === "ALL"
              ? "You haven't placed any orders yet. Complete order checkout features will be progressed further!"
              : `You do not have any orders with status "${activeTab}" currently.`}
          </p>
          <Link
            href="/shop"
            className="px-5 py-3 bg-forest hover:bg-forest/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
          >
            Go Shopping
          </Link>
        </div>
      ) : (
        /* Orders list */
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const { currentStep, isCancelled } = getStatusSteps(order.status);
            return (
              <div
                key={order._id}
                className="bg-white border border-gray-100 rounded-2xl shadow-2xs hover:shadow-xs transition-all overflow-hidden"
              >
                {/* Order Meta Header */}
                <div className="bg-slate-50/50 border-b border-gray-100 px-5 py-4 flex flex-col sm:flex-row justify-between gap-4 text-xs font-bold text-gray-500">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Date Placed</p>
                      <p className="text-gray-800 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Order ID</p>
                      <p className="text-gray-800 font-mono mt-0.5">#{order._id.substring(order._id.length - 8)}</p>
                    </div>
                    {order.trackingId && (
                      <div>
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Tracking ID</p>
                        <p className="text-gray-800 font-mono mt-0.5">{order.trackingId}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <span
                      className={`inline-block border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items & details */}
                <div className="p-5 space-y-4">
                  <div className="divide-y divide-gray-50">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between py-3.5 first:pt-0 last:pb-0"
                      >
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                            <Icon icon="lucide:package" className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h6 className="text-xs font-bold text-gray-900">
                              {item.product?.name || "Organic Product"}
                            </h6>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1">
                              Variant: {item.variant?.weight || "Default"} | Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-extrabold text-gray-900 pl-4">
                          ₹{(item.price || item.variant?.price || 0) * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-gray-100 my-2" />

                  {/* Summary aggregate details */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-charcoal/80 pt-2">
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">Payment:</span>
                          <span className="text-gray-800 font-bold uppercase tracking-wider">{order.paymentMethod}</span>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              order.paymentStatus === "SUCCESS"
                                ? "bg-green-50 text-green-700"
                                : order.paymentStatus === "FAILED"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-extrabold text-gray-900">
                          Total Paid: <span className="text-base text-forest">₹{order.totalPrice}</span>
                        </div>
                        <Link
                          href={`/account/orders/${order._id}`}
                          className="px-3 py-1.5 border border-forest/15 hover:bg-forest/5 text-forest text-[10px] font-bold rounded-lg transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                  {/* Status Timeline */}
                  {!isCancelled && (
                    <div className="pt-6 pb-2 px-1">
                      <div className="relative flex justify-between items-center max-w-md mx-auto">
                        {/* Connecting track line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-gray-100 top-1/2 -translate-y-1/2 z-0" />
                        <div
                          className="absolute left-0 h-0.5 bg-[#47C269] top-1/2 -translate-y-1/2 z-0 transition-all duration-500"
                          style={{
                            width: `${(currentStep / 3) * 100}%`,
                          }}
                        />

                        {/* Timeline Nodes */}
                        {["Placed", "Confirmed", "Shipped", "Delivered"].map((step, sIdx) => {
                          const isDone = currentStep >= sIdx;
                          const isCurrent = currentStep === sIdx;
                          return (
                            <div key={step} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isDone
                                    ? "bg-[#47C269] border-[#47C269] text-white shadow-xs"
                                    : "bg-white border-gray-200 text-gray-400"
                                } ${isCurrent ? "scale-110 ring-4 ring-[#47C269]/15" : ""}`}
                              >
                                {isDone ? (
                                  <Icon icon="solar:check-circle-bold" className="w-4.5 h-4.5" />
                                ) : (
                                  <span className="text-[9px] font-black">{sIdx + 1}</span>
                                )}
                              </div>
                              <span
                                className={`text-[9px] font-extrabold mt-1.5 uppercase tracking-wide transition-colors ${
                                  isDone ? "text-forest" : "text-gray-400"
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
