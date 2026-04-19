"use client";

import Link from "next/link";
import { ShoppingCart, Check, Menu } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <div className="bg-[#EAEAEA] rounded-[1.25rem] flex flex-col h-[230px] relative overflow-hidden transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98]">
        
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
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/5 text-black/10 font-akina text-2xl font-bold">
                AI
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Overlays - Category */}
        <div className="absolute top-3 left-4 z-20">
          <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-[7px] font-akina font-bold uppercase tracking-[0.2em] text-white border border-white/10 drop-shadow-md">
            {product.category}
          </span>
        </div>
        <button className="absolute top-3 right-4 z-20 w-7 h-7 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/10 opacity-60 hover:opacity-100 transition-opacity drop-shadow-md">
          <Menu className="w-3 h-3" />
        </button>

        {/* Content Section - Absolute Bottom Overlay - No Blur, with Shadows */}
        <div className="absolute inset-x-0 bottom-0 p-4 pt-10 z-10 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex justify-between items-end gap-2">
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="text-base font-akina font-bold leading-tight text-white tracking-tight mb-0.5 truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-akina font-black text-[#FF8C00] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-[8px] font-akina font-bold text-white/60 line-through decoration-white/40 drop-shadow-sm">
                  {(product.price * 1.3).toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {/* Action Button - Prominent Shadow */}
            <motion.button 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.3)] bg-white text-black shrink-0 border border-black/5 hover:border-black/20"
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <ShoppingCart className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Background text decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.02] font-akina font-black text-4xl select-none pointer-events-none uppercase rotate-6">
          {product.category}
        </div>
      </div>
    </Link>
  );
}
