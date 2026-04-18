"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Search, User, Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products, Product } from "@/lib/data";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { cartCount, addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart(product);
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* 
        ========================================================================
        NAVBAR STABLE ROW
        ========================================================================
      */}
      <nav className="w-full max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between gap-8 z-50">
        
        {/* Left: Navigation Links */}
        <div className="hidden lg:flex flex-1 gap-6 text-sm font-medium">
          <Link href="/products" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            Explore <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"><ArrowRight className="w-3 h-3" /></div>
          </Link>
          <Link href="#" className="hover:opacity-70 transition-opacity">Collections</Link>
        </div>

        {/* Center: Search Bar & Brand Name */}
        <div className="flex-[2] flex flex-col items-center gap-2 min-w-0">
          <div className="text-[10px] tracking-[0.2em] font-medium uppercase text-primary/60 hidden sm:block">
            - LUKARI -
          </div>
          <div className="relative w-full max-w-md group">
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/[0.03] border border-primary/10 rounded-full px-6 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:bg-white transition-all text-center font-medium placeholder:text-primary/40"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
          </div>
        </div>

        {/* Right: Cart & User */}
        <div className="flex-1 flex justify-end gap-6 items-center">
          <Link href="/cart" className="relative hover:opacity-70 transition-opacity flex items-center gap-2 group">
            <span className="text-sm font-medium hidden sm:block group-hover:text-primary/80">Cart</span>
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </nav>

      {/* 
        ========================================================================
        HERO SECTION (FIXED OVERLAPPING)
        ========================================================================
      */}
      <main className="flex-1 w-full flex flex-col items-center">
        {!searchQuery && (
          <div className="relative w-full max-w-[1440px] px-6 h-[40vh] min-h-[300px] max-h-[500px] flex items-center justify-center mb-12 overflow-hidden rounded-3xl mx-auto">
            
            {/* Massive Background Text - Bounded perfectly */}
            <h1 className="absolute inset-0 flex items-center justify-center font-display font-black text-[clamp(3rem,12vw,10rem)] leading-none text-primary/5 select-none pointer-events-none tracking-tighter">
              LUKARI
            </h1>

          </div>
        )}

        {/* 
          ========================================================================
          PRODUCT GRID (BENTO CARDS FIXED)
          ========================================================================
        */}
        <div className="w-full max-w-[1440px] mx-auto px-6 mb-24">
          
          {/* Quick Filters */}
          <div className="flex gap-2 flex-wrap justify-center md:justify-start mb-8">
            {['all', 'ai', 'office', 'design', 'os'].map((tag) => {
              const isActive = searchQuery.toLowerCase() === tag || (searchQuery === '' && tag === 'all');
              return (
                <button 
                  key={tag} 
                  onClick={() => setSearchQuery(tag === 'all' ? '' : tag)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide border transition-colors ${
                    isActive 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-transparent border-primary/20 text-primary hover:border-primary/50'
                  }`}
                >
                  {tag.toUpperCase()}
                </button>
              );
            })}
          </div>
          
          {searchQuery && (
            <div className="mb-8 flex items-center justify-between border-b border-primary/10 pb-4">
              <h2 className="text-2xl font-display">Results for <span className="font-bold">"{searchQuery}"</span></h2>
              <span className="text-sm font-medium border border-primary/20 px-4 py-1.5 rounded-full">{filteredProducts.length} items</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => {
              const isAdded = addedItems[product.id];
              
              return (
                <Link 
                  href={`/products/${product.id}`} 
                  key={product.id} 
                  className="bg-bento rounded-2xl p-5 flex flex-col relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-border/50"
                >
                  {/* Header: Number & Tag */}
                  <div className="flex justify-between items-start z-10 mb-4">
                    <span className="text-sm font-display font-medium text-primary/60">
                      /{(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="px-3 py-1 bg-white/60 backdrop-blur-md border border-white/40 rounded-full text-[9px] font-bold uppercase tracking-wider text-primary">
                      {product.category}
                    </span>
                  </div>

                  {/* Image Container with Safe Bounds */}
                  <div className="w-full h-40 bg-white/40 rounded-xl flex items-center justify-center p-4 z-10 relative mb-4 group-hover:bg-white/60 transition-colors">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500 ease-out" 
                      />
                    ) : (
                      <div className="text-primary/20 font-display text-4xl font-bold">NO IMG</div>
                    )}
                  </div>

                  {/* Info & CTA Footer */}
                  <div className="mt-auto z-10 flex flex-col gap-2">
                    <h3 className="text-lg font-display font-bold leading-tight text-primary line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-end justify-between mt-1 pt-3 border-t border-primary/10">
                      <div className="flex flex-col">
                        {product.originalPrice && (
                          <span className="text-[10px] line-through text-primary/40 font-medium mb-0.5">
                            {product.originalPrice.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                        <span className="text-lg font-bold tracking-tight text-primary">
                          {product.price.toLocaleString('vi-VN')}₫
                          <span className="text-[10px] font-medium text-primary/60 ml-1 tracking-normal">/{product.billingCycle}</span>
                        </span>
                      </div>

                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`h-9 px-4 rounded-full flex items-center justify-center gap-1.5 font-bold text-xs transition-all shadow-sm ${
                          isAdded 
                            ? "bg-green-600 text-white ring-2 ring-green-600/20" 
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      >
                        {isAdded ? (
                          <><Check className="w-3 h-3" /> Added</>
                        ) : (
                          <><Plus className="w-3 h-3" /> Add</>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center gap-4">
              <Search className="w-12 h-12 text-primary/20" />
              <div className="font-display text-2xl text-primary/40 font-medium">
                No products found.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
