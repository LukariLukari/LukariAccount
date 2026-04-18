"use client";

import Link from "next/link";
import { Star, ShoppingCart, Check } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-secondary border border-border rounded-lg overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              No Image
            </div>
          )}
          <div className="absolute top-2 left-2 px-2 py-1 bg-background border border-border rounded text-xs font-semibold text-foreground shadow-sm">
            {product.category}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.id}`} className="block mb-2 group">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>
        
        <div className="flex items-center gap-1 mb-4 text-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span className="text-muted-foreground ml-1">({product.downloads})</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="font-bold text-lg text-foreground">
              {product.price.toLocaleString('vi-VN')}₫
              <span className="text-xs text-muted-foreground font-normal ml-1">/{product.billingCycle}</span>
            </div>
            {product.originalPrice && (
              <div className="text-xs text-muted-foreground line-through">
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </div>
            )}
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-2 transition-all ${
              added 
                ? "bg-green-600 text-white shadow-none" 
                : "bg-cta hover:bg-cta/90 text-white shadow-glow"
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />} 
            {added ? "Đã thêm" : "Add"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
