"use client";

import { CreditCard, Check } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      onClick={handleAddToCart}
      className={`w-full py-4 rounded-md font-semibold text-lg transition-all flex items-center justify-center gap-2 mb-6 ${
        added 
          ? "bg-green-600 text-white shadow-none" 
          : "bg-cta hover:bg-cta/90 text-white shadow-glow"
      }`}
    >
      {added ? <Check className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />} 
      {added ? "Đã thêm vào giỏ" : "Mua Ngay (Thêm vào giỏ)"}
    </motion.button>
  );
}
