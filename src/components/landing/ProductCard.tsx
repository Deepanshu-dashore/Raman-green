"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItemToCart } from "@/store/cartSlice";
import { showAuthModal } from "@/store/authSlice";
import AddedToCartToast from "@/components/shared/AddedToCartToast";

// Interface defining the fields of the Product Card
export interface ProductCardFields {
  id?: string; // Optional product id for detail page routing
  name: string;
  description: string;
  price: string;
  originalPrice?: string; // Optional strikethrough price
  image: string;
  hoverImage?: string; // Optional second image for hover effect
  tags: string[];
}

// Props for the ProductCard component
export interface ProductCardProps {
  product: ProductCardFields;
  index: number;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, index, onAddToCart }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      dispatch(showAuthModal());
      return;
    }

    if (onAddToCart) {
      onAddToCart();
      return;
    }

    try {
      setIsAdding(true);
      const parsedPrice = parseFloat(product.price.replace(/[^\d.]/g, "")) || 0;
      const variantObj = {
        weight: "250 g", // Default weight since variant is not selected in card listing
        price: parsedPrice,
        sku: `${product.id || 'unknown'}-250g`
      };

      const productInfo = {
        name: product.name,
        image: product.image,
        category: product.tags[0] || "Organic"
      };

      const res = await dispatch(
        addItemToCart({
          productId: product.id || "unknown",
          variant: variantObj,
          quantity: 1,
          productInfo
        })
      ).unwrap();

      // Trigger custom attractive toast below navigation bar
      toast.custom(
        (t) => (
          <AddedToCartToast
            visible={t.visible}
            id={t.id}
            productName={product.name}
            productImage={product.image}
            variantWeight="250 g"
            variantPrice={parsedPrice}
            quantity={1}
            cartTotalItems={res.totalItems ?? 0}
            cartTotalPrice={res.totalPrice ?? 0}
          />
        ),
        {
          duration: 6000,
          position: "top-right",
        }
      );
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : (err.message || "Failed to add product to cart."));
    } finally {
      setIsAdding(false);
    }
  };

  const productLink = `/shop/${product.id || "7"}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="group cursor-pointer flex flex-col justify-between h-full bg-white p-4 rounded-xl border border-charcoal/5 shadow-none hover:shadow-[0_12px_32px_rgba(27,48,34,0.04)] hover:-translate-y-1 hover:border-forest/10 transition-all duration-300"
    >
      <Link href={productLink} className="flex-grow select-none">
        {/* Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-cream-dark/30 mb-4 select-none">
          <img
            src={product.image}
            alt={product.name}
            draggable="false"
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 select-none"
          />
          {product.hoverImage && (
            <img
              src={product.hoverImage}
              alt={`${product.name} alternate view`}
              draggable="false"
              className="absolute inset-0 w-full h-full object-cover scale-100 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 select-none"
            />
          )}
        </div>

        {/* Info */}
        <h3 className="font-playfair text-base font-semibold text-charcoal group-hover:text-forest transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-xs font-inter text-charcoal/55 mt-1 leading-relaxed line-clamp-2">
          {product.description}
        </p>


      </Link>

      {/* Price & CTA */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-charcoal/5">
        <Link href={productLink} className="flex items-baseline gap-1.5 flex-wrap select-none">
          <span className="font-inter text-sm font-bold text-charcoal">{product.price}</span>
          {product.originalPrice && (
            <span className="font-inter text-xs text-charcoal/40 line-through font-medium">
              {product.originalPrice}
            </span>
          )}
        </Link>
        <button 
          onClick={handleAddToCartClick}
          disabled={isAdding}
          className="inline-flex items-center justify-center gap-1 min-w-[95px] px-3 py-1.5 bg-forest text-white text-[11px] font-inter font-semibold tracking-wider rounded hover:bg-forest/90 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <>
              <Icon icon="mdi:loading" className="animate-spin w-3 h-3" />
              Adding...
            </>
          ) : (
            <>
              <Icon icon="solar:cart-large-2-linear" className="w-3 h-3" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
