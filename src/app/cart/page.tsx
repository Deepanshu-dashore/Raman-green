"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeItemFromCart, updateItemQuantity } from "@/store/cartSlice";
import LandingLayout from "@/components/landing/LandingLayout";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, totalPrice, totalItems, loading } = useAppSelector((state) => state.cart);
  const user = useAppSelector((state) => state.auth.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuantityChange = async (productId: string, variant: any, currentQty: number, change: number) => {
    const targetQty = currentQty + change;
    if (targetQty <= 0) {
      handleRemoveItem(productId, variant);
      return;
    }
    try {
      await dispatch(
        updateItemQuantity({
          productId,
          variant,
          quantity: targetQty,
        })
      ).unwrap();
    } catch (e: any) {
      toast.error(e.message || "Failed to update item quantity.");
    }
  };

  const handleRemoveItem = async (productId: string, variant: any) => {
    try {
      await dispatch(
        removeItemFromCart({
          productId,
          variant,
        })
      ).unwrap();
      toast.success("Item removed from cart.");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove item.");
    }
  };

  if (!mounted) {
    return (
      <LandingLayout>
        <div className="w-full bg-[#FAF9F6] min-h-[500px] flex items-center justify-center">
          <Icon icon="mdi:loading" className="animate-spin text-forest w-8 h-8" />
        </div>
      </LandingLayout>
    );
  }

  const shippingLimit = 499;
  const shippingFee = totalPrice >= shippingLimit || totalItems === 0 ? 0 : 50;
  const grandTotal = totalPrice + shippingFee;

  return (
    <LandingLayout>
      <div className="w-full bg-[#f9f9f9] min-h-screen pb-12 font-inter text-charcoal">
        <div className="max-w-[1280px] mx-auto px-4 pt-6 md:pt-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900 leading-none mb-1">
                Your Shopping Cart
              </h1>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                <Icon icon="solar:leaf-bold" className="w-3.5 h-3.5 text-[#3eac5c]" />
                <span>{totalItems} items selected</span>
              </div>
            </div>
            <Link href="/shop" className="text-[#3eac5c] text-xs font-bold flex items-center gap-1 hover:underline">
              <Icon icon="solar:arrow-left-linear" className="w-3.5 h-3.5" />
              Continue Shopping
            </Link>
          </div>

          {items.length === 0 ? (
            /* Premium Empty Cart Page */
            <div className="bg-white rounded-2xl border border-gray-100/50 p-10 md:p-16 text-center max-w-xl mx-auto flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Icon icon="solar:bag-3-bold-duotone" className="w-8 h-8 text-[#3eac5c]" />
              </div>
              <h3 className="font-playfair text-xl md:text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h3>
              <p className="text-xs text-gray-400 font-medium max-w-xs mb-6 leading-relaxed">
                Add fresh field crops, nutritious organic powders, or healthy seeds to begin your wellness journey today.
              </p>
              <Link
                href="/shop"
                className="px-6 py-3 bg-[#1b3022] hover:bg-[#233f2d] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Left Column */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {/* Cart Items List */}
                <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] p-4 md:p-5 border border-gray-100/50">
                  <div className="flex flex-col">
                    {items.map((item, idx) => {
                      const price = item.price || item.variant?.price || 0;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-start sm:items-center py-4 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0 gap-4"
                        >
                          {/* Image */}
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative border border-black/5">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon icon="lucide:package" className="w-6 h-6 text-gray-300" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                            <div>
                              <h4 className="text-sm md:text-base font-bold text-gray-900 mb-0.5 line-clamp-1">
                                {item.product?.name || "Organic Product"}
                              </h4>
                              <p className="text-xs text-gray-400 mb-2 font-medium">
                                Weight: {item.variant?.weight || "50 Gram"}
                              </p>
                              <div className="inline-flex items-center gap-1 bg-[#f5f9f5] px-2 py-0.5 rounded-md border border-[#e8f2e8]">
                                <Icon icon="solar:leaf-linear" className="w-3 h-3 text-[#3eac5c]" />
                                <span className="text-[10px] font-bold text-gray-600">Standard Pack</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium text-[#3eac5c]">
                              <span>100% Natural</span>
                              <span className="text-gray-300">•</span>
                              <span>Organic Certified</span>
                            </div>
                          </div>

                          {/* Controls & prices */}
                          <div className="flex sm:flex-col items-end justify-between sm:h-full sm:self-stretch py-0.5 gap-3 sm:gap-1.5 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-dashed border-gray-100">
                            <div className="flex flex-col sm:items-end">
                              <span className="text-[11px] text-gray-400 font-medium">Price</span>
                              <span className="text-xs font-semibold text-gray-600">
                                ₹{price}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Quantity Selector */}
                              <div className="flex items-center justify-between border border-gray-200 rounded-full px-0.5 py-0.5 w-[85px] h-7 bg-white">
                                <button
                                  onClick={() => handleQuantityChange(item.product._id, item.variant, item.quantity, -1)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
                                >
                                  <Icon icon="ic:baseline-minus" className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-xs text-gray-900 w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.product._id, item.variant, item.quantity, 1)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
                                >
                                  <Icon icon="ic:baseline-plus" className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove button */}
                              <button
                                onClick={() => handleRemoveItem(item.product._id, item.variant)}
                                className="w-7 h-7 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors border border-gray-100"
                                aria-label="Remove item"
                              >
                                <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-gray-400 font-medium sm:block hidden">Total</span>
                              <span className="text-sm font-bold text-gray-900">
                                ₹{price * item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-[#fcfdfc] rounded-2xl border border-[#eef5ef] p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-[#47C269]">
                      <Icon icon="solar:leaf-bold-duotone" className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-gray-900">100% Organic</h5>
                      <p className="text-[9px] text-gray-400 font-medium">Pure & Natural</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-[#47C269]">
                      <Icon icon="solar:home-smile-angle-bold-duotone" className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-gray-900">Farm Fresh</h5>
                      <p className="text-[9px] text-gray-400 font-medium">Direct Sourcing</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-[#47C269]">
                      <Icon icon="solar:box-minimalistic-bold-duotone" className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-gray-900">Eco-Packaging</h5>
                      <p className="text-[9px] text-gray-400 font-medium">Safe & Hygienic</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-[#47C269]">
                      <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-gray-900">Quality Assured</h5>
                      <p className="text-[9px] text-gray-400 font-medium">Lab Tested</p>
                    </div>
                  </div>
                </div>

                {/* You may also like */}
                <div className="bg-[#fcfdfc] rounded-2xl border border-[#eef5ef] p-4 md:p-5">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="font-playfair text-lg font-bold text-gray-900">You may also like</h3>
                    <Link href="/shop" className="text-[#3eac5c] text-xs font-bold hover:underline">View all</Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    {[1, 2, 3, 4].map((i, index) => {
                       const names = ["Multigrain Atta", "Organic Wheat Flour", "Green Chilli Powder", "Ginger Powder"];
                       const weights = ["1 kg", "1 kg", "50 Gram", "50 Gram"];
                       const prices = [129, 109, 129, 149];
                       return (
                         <div key={i} className="flex flex-col bg-white p-2 rounded-xl border border-gray-100">
                           <div className="bg-[#f4ebe1]/40 rounded-lg aspect-[4/5] relative mb-2 p-2 flex items-center justify-center hover:shadow-xs transition-shadow cursor-pointer">
                             <Icon icon="solar:heart-linear" className="absolute top-2 right-2 w-4 h-4 text-gray-400 bg-white rounded-full p-0.5 shadow-sm hover:text-red-500 hover:fill-red-500 transition-colors" />
                             <img src="/placeholder.png" className="w-full h-full object-contain" alt="Product" />
                           </div>
                           <h5 className="font-bold text-[11px] text-gray-900 mb-0.5 line-clamp-1">{names[index]}</h5>
                           <p className="text-[9px] text-gray-400 font-medium mb-1.5">{weights[index]}</p>
                           <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-gray-50">
                             <span className="font-bold text-xs text-gray-900">₹{prices[index]}</span>
                             <button className="bg-[#1b3022] hover:bg-[#233f2d] transition-colors text-white text-[9px] px-2 py-1 rounded flex items-center gap-0.5 font-bold cursor-pointer">
                               <Icon icon="solar:cart-large-2-linear" className="w-2.5 h-2.5" /> Add
                             </button>
                           </div>
                         </div>
                       );
                    })}
                  </div>
                </div>

              </div>
              
              {/* Right Column - Order Summary Side Card */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] p-4 md:p-5 border border-gray-100/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-[#3eac5c]">
                      <Icon icon="solar:bag-3-bold-duotone" className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="font-playfair text-lg font-bold text-gray-900">
                      Order Summary
                    </h3>
                  </div>
 
                  <div className="space-y-3.5 text-xs font-semibold text-gray-500 border-b border-gray-100 pb-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="text-gray-900 font-bold">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shipping</span>
                      <span className="text-gray-900 font-bold text-xs">
                        {shippingFee === 0 ? (
                          <span className="text-[#3eac5c]">FREE</span>
                        ) : (
                          `₹${shippingFee}`
                        )}
                      </span>
                    </div>
 
                    {/* Progress Bar Shipping */}
                    <div className="bg-[#f5f9f5] rounded-xl p-3 mt-4 border border-[#eef5ef]">
                      {shippingFee > 0 ? (
                        <>
                          <div className="flex gap-1.5 items-start mb-2 text-[11px]">
                            <Icon icon="solar:leaf-bold" className="w-4.5 h-4.5 text-[#3eac5c] mt-0.5 shrink-0" />
                            <span className="text-gray-700 font-semibold leading-tight">
                              Add <strong>₹{shippingLimit - totalPrice}</strong> more for <span className="text-[#3eac5c] font-bold">FREE shipping!</span>
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1 relative">
                             <div className="h-full bg-[#3eac5c] rounded-full" style={{ width: `${Math.min((totalPrice / shippingLimit) * 100, 100)}%` }} />
                          </div>
                        </>
                      ) : (
                        <div className="flex gap-1.5 items-center text-[11px]">
                          <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#3eac5c]" />
                          <span className="text-[#3eac5c] font-bold">You qualify for FREE Shipping!</span>
                        </div>
                      )}
                    </div>
                  </div>
 
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-900">Grand Total</span>
                      <span className="text-xl font-bold text-[#3eac5c] leading-none">₹{grandTotal}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-1">
                      (Inclusive of all taxes)
                    </div>
                  </div>
 
                  {/* Checkout button */}
                  <Link
                    href={user ? "/checkout" : `/login?redirect=${encodeURIComponent("/checkout")}`}
                    className="w-full h-11 flex items-center justify-between px-4 bg-[#1b3022] hover:bg-[#233f2d] text-white text-xs font-bold rounded-lg transition-all shadow-sm mb-3"
                  >
                    <span>Proceed to Checkout</span>
                    <Icon icon="solar:arrow-right-linear" className="w-4.5 h-4.5" />
                  </Link>
 
                  <div className="bg-[#f2faf4] text-[#3eac5c] text-[11px] font-bold py-2.5 rounded-lg text-center flex items-center justify-center gap-1.5">
                    <Icon icon="solar:confetti-bold-duotone" className="w-4 h-4" />
                    Secure Checkout Guaranteed
                  </div>
                </div>
 
                {/* Secure checkout assurances */}
                <div className="bg-[#fcfdfc] border border-[#eef5ef] rounded-2xl p-4 space-y-4">
                  <div className="flex gap-3 items-start">
                    <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5 text-[#3eac5c] shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-gray-900">Secure SSL Encrypted Checkout</h5>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Your data is 100% protected</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Icon icon="solar:refresh-circle-bold-duotone" className="w-5 h-5 text-[#3eac5c] shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-gray-900">Easy Returns & Refunds</h5>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">7 days easy return policy</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Icon icon="solar:routing-2-bold-duotone" className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-gray-900">Express Delivery</h5>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Delivered safely to your door</p>
                    </div>
                  </div>
                </div>
 
                {/* Payment Methods */}
                <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] p-4 border border-gray-100/50">
                  <h4 className="text-[11px] font-bold text-gray-900 mb-3 uppercase tracking-wider text-charcoal/50">We Accept</h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="px-2.5 py-1 border border-gray-200 rounded-md flex items-center justify-center bg-white text-[9px] font-black text-blue-800 tracking-wider">
                      VISA
                    </div>
                    <div className="px-2.5 py-1 border border-gray-200 rounded-md flex items-center justify-center bg-white text-[9px] font-bold text-red-500">
                      MasterCard
                    </div>
                    <div className="px-2.5 py-1 border border-gray-200 rounded-md flex items-center justify-center bg-white text-[9px] font-bold text-orange-600">
                      RuPay
                    </div>
                    <div className="px-2.5 py-1 border border-gray-200 rounded-md flex items-center justify-center bg-white text-[9px] font-bold text-gray-700">
                      UPI
                    </div>
                    <div className="px-2.5 py-1 border border-gray-200 rounded-md flex items-center justify-center bg-white text-[9px] font-bold text-cyan-600">
                      Paytm
                    </div>
                  </div>
                </div>
              </div>
 
            </div>
          )}

        </div>
      </div>
    </LandingLayout>
  );
}
