"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag, Search, Menu as MenuIcon, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products } from "@/lib/data";
import { useState, useMemo } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const { cartCount, addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Featured products for carousel
  const featuredProducts = useMemo(() => products.slice(0, 4), []);

  // Auto-slide effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans">
      {/* 
        ========================================================================
        HERO SECTION: SIDEBAR + BANNER
        ========================================================================
      */}
      <main className="pt-24 md:pt-32 pb-24">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            
            {/* Sidebar: Categories */}
            <aside className="w-full md:w-[320px] shrink-0 h-[320px] md:h-[420px]">
              <div className="bg-white rounded-[2.5rem] p-6 md:p-7 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-black/[0.03] h-full flex flex-col overflow-hidden">
                <h2 className="font-akina font-black text-[9px] uppercase tracking-[0.4em] mb-6 text-black/30 flex items-center gap-2.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/10" />
                  Categories
                </h2>
                
                <nav className="flex flex-col gap-1.5 overflow-y-auto scrollbar-hide pr-1">
                  {['all', 'ai', 'office', 'design', 'os', 'video', 'combo ios'].map((tag) => {
                    const isActive = searchQuery.toLowerCase() === tag || (searchQuery === '' && tag === 'all');
                    return (
                      <button 
                        key={tag}
                        onClick={() => setSearchQuery(tag === 'all' ? '' : tag)}
                        className="relative group flex items-center justify-between px-6 py-4 rounded-2xl transition-colors duration-300 font-akina font-bold text-[10px] uppercase tracking-[0.15em] outline-none"
                      >
                        {/* Gliding Background Indicator */}
                        {isActive && (
                          <motion.div 
                            layoutId="activeCategory"
                            className="absolute inset-0 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-black/[0.03] rounded-2xl z-0"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        
                        <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-black' : 'text-black/40 group-hover:text-black/60'}`}>
                          {tag}
                        </span>
                        
                        <ArrowRight className={`relative z-10 w-3.5 h-3.5 transition-all duration-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'} ${isActive ? 'text-black' : 'text-black/20'}`} />
                      </button>
                    );
                  })}
                </nav>
                
                <div className="mt-auto pt-6 border-t border-black/5">
                  <div className="bg-black/[0.02] rounded-[1.25rem] p-4 border border-black/[0.03]">
                    <p className="text-[10px] font-akina font-black text-black leading-tight">Need help? Contact us.</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Hero Banner */}
            <section className="flex-1 relative h-[320px] md:h-[420px] rounded-[2.5rem] overflow-hidden bg-white group shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-black/5">
              {/* Liquid Glass Background Elements */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-black/[0.02] rounded-full blur-[120px]"
                />
                <motion.div 
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90],
                    x: [0, -50, 0],
                    y: [0, 30, 0]
                  }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#FF8C00]/[0.03] rounded-full blur-[100px]"
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 100) prevSlide();
                    else if (info.offset.x < -100) nextSlide();
                  }}
                  className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                >
                  <div className="absolute inset-0 w-full h-full">
                    <img 
                      src={featuredProducts[currentSlide].image} 
                      alt={featuredProducts[currentSlide].name}
                      className="w-full h-full object-cover transition-transform duration-[15000ms] ease-out group-hover:scale-110"
                    />
                    {/* No overlays as requested */}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Control */}
              <div className="absolute bottom-10 right-10 z-30 flex items-center gap-5 bg-white/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/40 shadow-xl">
                <motion.button 
                  whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,1)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevSlide}
                  className="hidden md:flex p-2 rounded-full text-black/40 hover:text-black transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
                </motion.button>

                <div className="flex gap-2">
                  {featuredProducts.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentSlide(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-black w-6' : 'bg-black/10'}`} 
                    />
                  ))}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,1)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextSlide}
                  className="hidden md:flex p-2 rounded-full text-black/40 hover:text-black transition-all duration-300"
                >
                  <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
                </motion.button>
              </div>
            </section>
          </div>
        </div>

        {/* Search Results / Product Grid Section */}
        <div className="w-full max-w-[1440px] mx-auto px-6 mt-24">
          
          {/* Old category section removed */}
          
          {searchQuery && (
            <div className="mb-8 flex items-center justify-between border-b border-primary/10 pb-4">
              <h2 className="text-2xl font-display">Results for <span className="font-bold">"{searchQuery}"</span></h2>
              <span className="text-sm font-medium border border-primary/20 px-4 py-1.5 rounded-full">{filteredProducts.length} items</span>
            </div>
          )}

          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.25, 
                    ease: "circOut",
                    layout: { duration: 0.3 }
                  }}
                >
                  <ProductCard product={product} index={idx} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

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
