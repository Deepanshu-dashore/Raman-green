"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Link from "next/link";

// Interface defining the fields of the Product Card
export interface ProductCardFields {
  id?: string; // Optional product id for detail page routing
  name: string;
  description: string;
  price: string;
  originalPrice?: string; // Optional strikethrough price
  image: string;
  tags: string[];
}

// Props for the ProductCard component
export interface ProductCardProps {
  product: ProductCardFields;
  index: number;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, index, onAddToCart }: ProductCardProps) {
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
      return;
    }

    // Default interactive add to cart mapping (so it works seamlessly on Homepage carousel too!)
    try {
      const existingCart = localStorage.getItem("rg-cart");
      let cart = [];
      if (existingCart) {
        cart = JSON.parse(existingCart);
      }
      cart.push({
        id: product.id || Math.random().toString(),
        name: product.name,
        price: parseFloat(product.price.replace(/[^\d.]/g, "")) || 0,
        image: product.image,
        category: product.tags[0] || "Organic",
      });
      localStorage.setItem("rg-cart", JSON.stringify(cart));
      localStorage.setItem("rg-cart-count", cart.length.toString());
      
      // Dispatch storage event to trigger Navbar sync
      window.dispatchEvent(new Event("storage"));
      
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add product to cart.");
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
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
          />
        </div>

        {/* Info */}
        <h3 className="font-playfair text-base font-semibold text-charcoal group-hover:text-forest transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-xs font-inter text-charcoal/55 mt-1 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-[10px] font-inter font-medium uppercase tracking-wider text-moss bg-sage/30 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
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
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-forest text-white text-[11px] font-inter font-semibold tracking-wider rounded hover:bg-forest/90 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <Icon icon="solar:cart-large-2-linear" className="w-3 h-3" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
