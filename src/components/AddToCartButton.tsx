"use client";

import { ShoppingBag, Check } from "lucide-react";
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
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
        className="flex-1 px-8 py-4 rounded-full bg-black text-white font-akina font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-black/10"
        style={{ color: '#FFFFFF' }}
      >
        Thanh toán ngay
      </motion.button>

      {/* Cart Button */}
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={handleAddToCart}
        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          added 
            ? "bg-white border-black text-black" 
            : "bg-white border-black/5 text-black hover:border-black/20"
        }`}
      >
        <AnimatePresence mode="wait">
          {added ? (
            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <ShoppingBag className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
