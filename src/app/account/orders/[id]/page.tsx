"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useApiQuery } from "@/hooks/useApiQuery";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    image?: string;
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
  address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  createdAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  // Fetch order details using TanStack Query caching
  const { data: order, isLoading, error } = useApiQuery<Order>(
    ["order", orderId],
    `/api/orders/${orderId}`
  );

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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadInvoice = () => {
    toast.success("Invoice download started! (Mock File Generated)");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-100 rounded-md" />
        <div className="h-28 bg-gray-50 rounded-2xl border border-gray-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-50 rounded-2xl" />
          <div className="h-48 bg-gray-50 rounded-2xl" />
        </div>
        <div className="h-40 bg-gray-50 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="border border-dashed border-gray-200 rounded-3xl p-10 md:p-14 text-center max-w-xl mx-auto flex flex-col items-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Icon icon="solar:shield-warning-linear" className="w-8 h-8 text-red-500" />
        </div>
        <h4 className="font-bold text-base text-gray-900 mb-1">Failed to Load Order</h4>
        <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed font-semibold">
          We couldn't retrieve the details for order ID: #{orderId.substring(orderId.length - 8)}.
        </p>
        <Link
          href="/account/orders"
          className="px-5 py-2.5 bg-forest hover:bg-forest/90 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const { currentStep, isCancelled } = getStatusSteps(order.status);
  
  // Calculate subtotal and shipping fees
  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + (item.price || item.variant?.price || 0) * item.quantity,
    0
  );
  const shippingFee = order.totalPrice - itemsSubtotal;

  return (
    <div className="space-y-8 font-inter text-charcoal">
      {/* Header & Back link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-[#3eac5c] hover:underline flex items-center gap-1.5 mb-2"
          >
            <Icon icon="solar:arrow-left-linear" className="w-4 h-4" />
            Back to My Orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-playfair font-extrabold text-gray-900 leading-none">
              Order Details
            </h1>
            <span className="font-mono text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
              #{order._id}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleDownloadInvoice}
          className="px-4 py-2 bg-forest hover:bg-forest/90 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Icon icon="solar:download-linear" className="w-4 h-4" />
          Download Invoice
        </button>
      </div>

      {/* Main Order Meta Info */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-2xs overflow-hidden">
        <div className="bg-slate-50/50 border-b border-gray-100 p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-gray-500">
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Date Placed</p>
            <p className="text-gray-800 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Payment Method</p>
            <p className="text-gray-800 mt-1 uppercase tracking-wider">{order.paymentMethod}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Payment Status</p>
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-1 ${
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
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Order Status</p>
            <span
              className={`inline-block border px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mt-1 ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Timeline tracking */}
        <div className="p-6 md:p-8 bg-white border-b border-gray-100">
          {isCancelled ? (
            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex gap-3 items-center text-rose-700">
              <Icon icon="solar:close-circle-bold" className="w-6 h-6 shrink-0" />
              <div>
                <h5 className="text-xs font-extrabold">This order has been cancelled</h5>
                <p className="text-[10px] text-rose-500 font-semibold mt-0.5">Please contact customer support for further assistance.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto pt-2">
              <div className="relative flex justify-between items-center">
                {/* Track lines */}
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone
                            ? "bg-[#47C269] border-[#47C269] text-white shadow-sm"
                            : "bg-white border-gray-200 text-gray-400"
                        } ${isCurrent ? "scale-110 ring-4 ring-[#47C269]/15" : ""}`}
                      >
                        {isDone ? (
                          <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-bold">{sIdx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold mt-2 uppercase tracking-wider transition-colors ${
                          isDone ? "text-forest" : "text-gray-400"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {order.trackingId && (
                <div className="mt-8 text-center text-xs font-semibold text-gray-500 border border-gray-100 rounded-xl p-3 bg-slate-50/30 max-w-sm mx-auto flex items-center justify-center gap-2">
                  <Icon icon="solar:delivery-linear" className="w-4 h-4 text-forest" />
                  <span>Tracking Number: <strong className="font-mono text-gray-800 font-bold">{order.trackingId}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shipping Address snapshot */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <Icon icon="solar:map-point-bold-duotone" className="w-5 h-5 text-forest" />
            Shipping Address
          </h3>
          <div className="space-y-1.5 text-xs font-semibold text-gray-600">
            <h4 className="font-extrabold text-gray-900 text-xs mb-1">{order.address?.fullName}</h4>
            <p className="leading-relaxed">{order.address?.address}</p>
            <p>{order.address?.city}, {order.address?.state} - {order.address?.postalCode}</p>
            <div className="h-px bg-gray-50 my-3" />
            <p className="flex items-center gap-1.5 text-gray-400 font-bold">
              <Icon icon="solar:phone-linear" className="w-4 h-4 text-gray-300" />
              Phone: <span className="text-gray-700 font-mono">{order.address?.phone}</span>
            </p>
          </div>
        </div>

        {/* Pricing Bill Summary breakdown */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <Icon icon="solar:bill-list-bold-duotone" className="w-5 h-5 text-forest" />
              Bill Details
            </h3>
            <div className="space-y-2.5 text-xs font-semibold text-gray-500">
              <div className="flex justify-between">
                <span>Items Subtotal ({order.totalItems} items)</span>
                <span className="text-gray-800">₹{itemsSubtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & Delivery Charges</span>
                <span className="text-gray-800">
                  {shippingFee === 0 ? <span className="text-forest font-bold">FREE</span> : `₹${shippingFee.toLocaleString("en-IN")}`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 mt-6">
            <div className="flex justify-between items-center text-sm font-extrabold text-gray-900">
              <span>Grand Total</span>
              <span className="text-forest text-base">₹{order.totalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Details List Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
          <Icon icon="solar:box-bold-duotone" className="w-5 h-5 text-forest" />
          Ordered Items
        </h3>
        
        <div className="divide-y divide-gray-100">
          {order.items.map((item, idx) => {
            const price = item.price || item.variant?.price || 0;
            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="lucide:package" className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-gray-900 leading-snug">{item.product?.name || "Organic Product"}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">
                      SKU: <span className="font-mono text-gray-600">{item.variant?.sku || "N/A"}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      Pack Weight: <span className="text-gray-600 font-bold">{item.variant?.weight || "Default"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-dashed border-gray-50 pt-2 sm:pt-0">
                  <div className="text-right text-xs">
                    <p className="text-gray-400 font-semibold">Price per unit</p>
                    <p className="text-gray-800 font-bold mt-0.5">₹{price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-400 font-semibold">Quantity</p>
                    <p className="text-gray-800 font-bold mt-0.5">&times; {item.quantity}</p>
                  </div>
                  <div className="text-right text-xs min-w-[70px]">
                    <p className="text-gray-400 font-semibold">Total Price</p>
                    <p className="text-gray-900 font-extrabold text-sm mt-0.5">₹{(price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Support help footer */}
      <div className="bg-[#FAF9E6]/30 border border-forest/10 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-forest shadow-2xs border border-forest/5">
            <Icon icon="solar:chat-square-call-linear" className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h5 className="font-extrabold text-gray-900">Need help with this order?</h5>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Have questions regarding delivery, refunds or items? Contact support team.</p>
          </div>
        </div>
        <Link
          href="/contact"
          className="px-4 py-2 border border-forest/10 hover:bg-forest/5 text-forest text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer"
        >
          Contact Customer Care
        </Link>
      </div>
    </div>
  );
}
