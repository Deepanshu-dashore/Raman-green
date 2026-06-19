"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import LandingLayout from "@/components/landing/LandingLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCartState } from "@/store/cartSlice";
import { get, post, put } from "@/lib/axios";

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = useAppSelector((state) => state.cart.totalItems);
  const cartSubtotal = useAppSelector((state) => state.cart.totalPrice);
  const user = useAppSelector((state) => state.auth.user);
  const loadingAuth = useAppSelector((state) => state.auth.loading);
  const initialized = useAppSelector((state) => state.auth.initialized);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // Calculate pricing
  const shippingCharge = cartSubtotal >= 499 ? 0 : 50;
  const grandTotal = cartSubtotal + shippingCharge;

  // Protect page
  useEffect(() => {
    if (initialized && !loadingAuth && !user) {
      toast.error("Please sign in to complete checkout.");
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
    }
  }, [initialized, loadingAuth, user, router]);

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await get<Address[]>("/api/address");
      if (res.success && Array.isArray(res.data)) {
        setAddresses(res.data);
        const defaultAddr = res.data.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (res.data.length > 0) {
          setSelectedAddressId(res.data[0]._id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load addresses.");
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  if (!user) return null;

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user.name || "",
      phone: user.phone || "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, phone, address, city, state, postalCode } = addressForm;

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      toast.error("Please fill in all address fields.");
      return;
    }

    if (phone.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    const payload = { ...addressForm, isDefault: addresses.length === 0 };

    try {
      if (editingAddress) {
        const res = await put<Address>(`/api/address/${editingAddress._id}`, payload);
        if (res.success) {
          toast.success("Address updated successfully.");
          fetchAddresses();
        }
      } else {
        const res = await post<Address>("/api/address", payload);
        if (res.success) {
          toast.success("Address added successfully.");
          fetchAddresses();
        }
      }
      setIsAddressModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save address.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const selectedAddressObj = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddressObj) return;

    setIsPlacingOrder(true);
    const toastId = toast.loading("Placing your order...");

    const orderPayload = {
      items: cartItems.map((item) => ({
        product: item.product._id,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: grandTotal,
      totalItems: cartCount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "SUCCESS", // Mock online as instant SUCCESS
      address: {
        fullName: selectedAddressObj.fullName,
        phone: selectedAddressObj.phone,
        address: selectedAddressObj.address,
        city: selectedAddressObj.city,
        state: selectedAddressObj.state,
        postalCode: selectedAddressObj.postalCode,
      },
    };

    try {
      const res = await post<any>("/api/orders", orderPayload);
      toast.dismiss(toastId);
      if (res.success && res.data) {
        toast.success("Congratulations! Your order has been placed.");
        dispatch(clearCartState());
        router.push("/account/orders");
      } else {
        toast.error(res.message || "Failed to place order.");
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "An error occurred while creating order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <LandingLayout>
      <div className="storefront bg-cream text-charcoal min-h-screen py-12 md:py-16 font-inter">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-playfair font-extrabold text-forest mb-2">Secure Checkout</h1>
            <p className="text-xs text-charcoal/50 leading-relaxed font-semibold">
              Fill in your details and place your order securely.
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-forest mb-4 border border-forest/10">
                <Icon icon="solar:cart-large-2-linear" className="w-7 h-7" />
              </div>
              <h3 className="font-playfair text-xl font-bold text-forest mb-2">Your Cart is Empty</h3>
              <p className="text-xs text-charcoal/50 leading-relaxed font-semibold max-w-xs mb-6">
                You cannot checkout with an empty cart. Fill it with organic goodness first!
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="bg-forest text-white text-xs font-bold uppercase tracking-wider py-3.5 px-8 rounded-xl hover:bg-forest/90 transition-colors shadow-sm cursor-pointer"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Shipping & Payment */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Shipping Address Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-[0_10px_30px_rgba(27,48,34,0.02)]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Icon icon="solar:map-point-bold-duotone" className="w-5.5 h-5.5 text-forest" />
                      1. Shipping Address
                    </h3>
                    <button
                      onClick={handleOpenAddAddress}
                      className="px-4 py-2 border border-forest/10 text-forest hover:bg-forest/5 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Icon icon="solar:add-folder-linear" className="w-4 h-4" />
                      Add New
                    </button>
                  </div>

                  {loadingAddresses ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-20 bg-gray-50 rounded-xl border border-gray-100" />
                      <div className="h-20 bg-gray-50 rounded-xl border border-gray-100" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center flex flex-col items-center">
                      <p className="text-xs text-gray-400 font-semibold mb-4">No shipping addresses saved yet.</p>
                      <button
                        onClick={handleOpenAddAddress}
                        className="px-5 py-2.5 bg-forest hover:bg-forest/90 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                              isSelected
                                ? "border-forest bg-[#FAF9E6]/30 shadow-xs"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-2 pr-16">
                                <h4 className="text-xs font-bold text-gray-900">{addr.fullName}</h4>
                                {addr.isDefault && (
                                  <span className="bg-sage/20 text-[#4d6700] text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-4">
                                {addr.address}, {addr.city}, {addr.state} - {addr.postalCode}
                              </p>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                              <span className="text-[10px] text-gray-400 font-bold font-mono">
                                <Icon icon="solar:phone-linear" className="w-3.5 h-3.5 inline mr-1 text-gray-300" />
                                {addr.phone}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditAddress(addr);
                                }}
                                className="text-[#47C269] hover:text-[#3eac5c] text-[10px] font-bold uppercase transition-colors"
                              >
                                Edit
                              </button>
                            </div>
                            {isSelected && (
                              <span className="absolute top-4 right-4 text-forest">
                                <Icon icon="solar:check-circle-bold" className="w-5.5 h-5.5" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Payment Method Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-[0_10px_30px_rgba(27,48,34,0.02)]">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <Icon icon="solar:card-2-bold-duotone" className="w-5.5 h-5.5 text-forest" />
                    2. Payment Method
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* COD Option */}
                    <div
                      onClick={() => setPaymentMethod("COD")}
                      className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                        paymentMethod === "COD"
                          ? "border-forest bg-[#FAF9E6]/30 shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <Icon
                          icon={paymentMethod === "COD" ? "solar:check-circle-bold" : "solar:circle-linear"}
                          className={`w-5 h-5 ${paymentMethod === "COD" ? "text-forest" : "text-gray-300"}`}
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</h4>
                        <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-1">
                          Pay with cash upon package arrival. (COD charge is free)
                        </p>
                      </div>
                    </div>

                    {/* ONLINE Option */}
                    <div
                      onClick={() => setPaymentMethod("ONLINE")}
                      className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                        paymentMethod === "ONLINE"
                          ? "border-forest bg-[#FAF9E6]/30 shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <Icon
                          icon={paymentMethod === "ONLINE" ? "solar:check-circle-bold" : "solar:circle-linear"}
                          className={`w-5 h-5 ${paymentMethod === "ONLINE" ? "text-forest" : "text-gray-300"}`}
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Online Card / UPI Payment</h4>
                        <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-1">
                          Secure online transactions with card, net banking, or UPI.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-[0_10px_30px_rgba(27,48,34,0.02)] space-y-6 lg:sticky lg:top-24">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">Order Summary</h3>

                {/* Items List */}
                <div className="max-h-60 overflow-y-auto space-y-3.5 pr-1 divide-y divide-gray-50">
                  {cartItems.map((item, idx) => {
                    const price = item.price || item.variant?.price || 0;
                    return (
                      <div key={idx} className="flex gap-3 items-center py-3.5 first:pt-0">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                          {item.product?.image ? (
                            <img src={item.product.image} alt={item.product?.name || "Product"} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon icon="lucide:package" className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 text-left">
                          <span className="text-xs font-bold truncate text-gray-800">{item.product?.name || "Organic Product"}</span>
                          <span className="text-[9px] text-gray-400 font-semibold mt-0.5">{item.variant?.weight || "Default"} &bull; Qty: {item.quantity}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-900 shrink-0">
                          ₹{(price * item.quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Costs Detail */}
                <div className="space-y-2 text-xs font-bold text-gray-500 border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-800">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-gray-800">{shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}</span>
                  </div>
                  {shippingCharge > 0 && (
                    <p className="text-[9px] text-forest font-semibold text-right leading-none mt-0.5">
                      Add ₹{(499 - cartSubtotal).toLocaleString("en-IN")} more for FREE shipping!
                    </p>
                  )}
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="flex justify-between text-sm font-extrabold text-gray-900">
                    <span>Grand Total</span>
                    <span className="text-forest text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* CTA Order Placement */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || addresses.length === 0}
                  className="w-full h-12 bg-forest hover:bg-forest/90 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed select-none"
                >
                  {isPlacingOrder ? (
                    <>
                      Placing Order...
                      <Icon icon="mdi:loading" className="animate-spin w-4.5 h-4.5" />
                    </>
                  ) : (
                    <>
                      Confirm & Place Order
                      <Icon icon="solar:arrow-right-linear" className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col font-inter animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-extrabold text-forest uppercase tracking-wider">
                {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
              </span>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient's Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:bg-white focus:border-forest transition-colors"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:bg-white focus:border-forest transition-colors"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "") })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Flat, House no., Area, Street</label>
                  <input
                    type="text"
                    required
                    placeholder="Street Address details"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:bg-white focus:border-forest transition-colors"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Town/City</label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:bg-white focus:border-forest transition-colors"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">State</label>
                    <input
                      type="text"
                      required
                      placeholder="State"
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:bg-white focus:border-forest transition-colors"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Postal Code (Pincode)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit pincode"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:bg-white focus:border-forest transition-colors"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>

              <div className="px-6 py-4.5 border-t border-gray-100 flex gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-100 transition-colors text-charcoal text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-forest hover:bg-forest/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LandingLayout>
  );
}
