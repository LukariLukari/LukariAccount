"use client";

import Link from "next/link";
import { ShoppingCart, Check, Menu, Plus, Minus } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { cart, addToCart, updateQuantity } = useCart();
  
  const cartItem = cart.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleUpdateQuantity = (e: React.MouseEvent, newQty: number) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, newQty);
  };

  return (
    <Link href={`/products/${product.slug}`} className="block h-full group">
      <div className="bg-paper/5 backdrop-blur-md rounded-2xl md:rounded-[1.25rem] flex flex-col h-[180px] sm:h-[230px] relative overflow-hidden transition-all duration-300 shadow-[0_10px_30px_rgba(239,237,227,0.1)] hover:shadow-[0_20px_40px_rgba(239,237,227,0.2)] hover:scale-[1.02] active:scale-[0.98] border border-paper/10">
        
        {/* Full Card Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full"
          >
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/5 text-black/10 font-akina text-2xl font-bold">
                AI
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Overlays - Category */}
        <div className="absolute top-2 md:top-3 left-3 md:left-4 z-20">
          <span className="px-1.5 md:px-2 py-0.5 rounded-full bg-paper/10 backdrop-blur-md text-[6px] md:text-[7px] font-akina font-bold uppercase tracking-[0.2em] text-paper border border-paper/10 drop-shadow-md">
            {product.category}
          </span>
        </div>
        <button className="absolute top-2 md:top-3 right-3 md:right-4 z-20 w-6 h-6 md:w-7 md:h-7 rounded-full bg-paper/10 backdrop-blur-md flex items-center justify-center text-paper border border-paper/10 opacity-60 hover:opacity-100 transition-opacity drop-shadow-md">
          <Menu className="w-2.5 h-2.5 md:w-3 md:h-3" />
        </button>

        {/* Content Section - Clear Overlay with Text Shadows */}
        <div className="absolute inset-x-0 -bottom-[1px] p-3 md:p-4 pt-8 md:pt-10 z-10 bg-gradient-to-t from-asphalt via-asphalt/40 to-transparent">
          <div className="flex justify-between items-end gap-1.5 md:gap-2">
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="text-[10px] sm:text-base font-montserrat font-bold leading-tight text-paper tracking-tight mb-0.5 truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                {product.name}
              </h3>
              <div className="flex flex-col">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[7px] sm:text-[10px] font-montserrat font-medium text-paper/40 line-through decoration-red-500/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    {formatPrice(product.originalPrice)}₫
                  </span>
                )}
                <span className="text-xs sm:text-lg font-montserrat font-bold text-[#FF8C00] drop-shadow-[0_2px_4px_rgba(255,140,0,0.3)]">
                  {formatPrice(product.price)}₫
                </span>
              </div>
            </div>

            {/* Action Button / Quantity Selector */}
            <div 
              className={`z-20 shrink-0 bg-paper rounded-full shadow-2xl border border-paper/20 flex items-center h-8 md:h-10 transition-all duration-300 ease-out overflow-hidden ${isInCart ? 'w-[80px] md:w-[110px]' : 'w-8 md:w-10'}`}
            >
              {!isInCart ? (
                <button 
                  onClick={handleAddToCart}
                  className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-[#302f2c] hover:bg-asphalt/5"
                >
                  <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#302f2c] stroke-[3px]" />
                </button>
              ) : (
                <div className="flex items-center px-1 w-full justify-between animate-in fade-in duration-300">
                  <button
                    onClick={(e) => handleUpdateQuantity(e, cartItem.quantity - 1)}
                    className="w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center hover:bg-asphalt/10 transition-colors"
                  >
                    <Minus className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-[#302f2c] stroke-[3px]" />
                  </button>
                  
                  <span className="font-montserrat font-bold text-[9px] md:text-[11px] text-[#302f2c]">
                    {cartItem.quantity}
                  </span>
                  
                  <button
                    onClick={(e) => handleUpdateQuantity(e, cartItem.quantity + 1)}
                    className="w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center hover:bg-asphalt/10 transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-[#302f2c] stroke-[3px]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Background text decoration - Hidden on small mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.02] font-montserrat font-bold text-2xl md:text-4xl select-none pointer-events-none uppercase rotate-6 hidden sm:block">
          {product.category}
        </div>
      </div>
    </Link>
  );
}
