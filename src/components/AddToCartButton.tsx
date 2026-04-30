"use client";

import { ShoppingBag, Check, Plus, Minus } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AddToCartButton({ 
  product, 
  quantity = 1 
}: { 
  product: Product; 
  quantity?: number;
}) {
  const { cart, addToCart, updateQuantity } = useCart();
  const router = useRouter();

  const cartItem = cart.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, quantity);
  };

  const handleUpdateQuantity = (e: React.MouseEvent, newQty: number) => {
    e.preventDefault();
    updateQuantity(product.id, newQty);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, quantity);
    router.push("/cart");
  };

  return (
    <div className="flex gap-3 w-full max-w-sm">
      {/* Pay Now Button */}
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={handleBuyNow}
        className="flex-1 px-8 py-4 rounded-full !bg-[#efede3] !text-[#302f2c] font-akina font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
        style={{ backgroundColor: '#efede3', color: '#302f2c' }}
      >
        Thanh toán ngay
      </motion.button>

      {/* Cart Button / Quantity Selector */}
      <div 
        className={`h-14 bg-paper/5 backdrop-blur-xl border border-paper/10 rounded-full flex items-center transition-all duration-300 ease-out overflow-hidden shadow-xl ${isInCart ? 'w-[140px]' : 'w-14'}`}
      >
        <AnimatePresence mode="wait">
          {!isInCart ? (
            <motion.button 
              key="add"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleAddToCart}
              className="w-14 h-14 flex items-center justify-center text-paper hover:bg-paper/10"
            >
              <ShoppingBag className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.div 
              key="qty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between px-4 w-full"
            >
              <button
                onClick={(e) => handleUpdateQuantity(e, cartItem.quantity - 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-paper/10 transition-colors"
              >
                <Minus className="w-4 h-4 text-paper stroke-[3px]" />
              </button>
              
              <span className="font-akina font-black text-base text-paper">
                {cartItem.quantity}
              </span>
              
              <button
                onClick={(e) => handleUpdateQuantity(e, cartItem.quantity + 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-paper/10 transition-colors"
              >
                <Plus className="w-4 h-4 text-paper stroke-[3px]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
