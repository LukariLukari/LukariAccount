"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag, Search } from "lucide-react";
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
        FLOATING GLASS NAVBAR
        ========================================================================
      */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-[100] backdrop-blur-2xl bg-white/60 border border-white/20 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="px-6 sm:px-10 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-akina font-black text-xl shadow-xl group-hover:scale-110 transition-transform duration-500">
              L
            </div>
            <span className="font-akina font-black tracking-tighter text-2xl hidden sm:block">LukariAccount</span>
          </Link>

          {/* Search Bar in Header - More Integrated */}
          <div className="flex-1 max-w-sm relative group hidden md:block">
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/[0.03] border border-black/5 rounded-full px-10 py-2.5 text-[11px] font-akina font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all placeholder:text-black/20"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/20 group-focus-within:text-black transition-colors" />
          </div>

          <div className="flex items-center gap-6 sm:gap-10 shrink-0">
            <div className="hidden sm:flex items-center gap-8">
              {['Products', 'Prices'].map((item) => (
                <Link 
                  key={item} 
                  href={`/${item.toLowerCase()}`} 
                  className="text-[10px] font-akina font-bold uppercase tracking-widest text-black/40 hover:text-black transition-all relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>

            <Link href="/cart" className="relative group shrink-0 p-2 hover:bg-black/5 rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5 text-black/60 group-hover:text-black transition-colors" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center rounded-full font-akina font-bold ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* 
        ========================================================================
        HERO CAROUSEL (REDUCED SIZE + AUTO SLIDE)
        ========================================================================
      */}
      <main className="pt-16">
        <section className="relative h-[45vh] min-h-[380px] w-full overflow-hidden bg-white group">
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
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Full Background Image with Chromatic Aberration feel */}
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={featuredProducts[currentSlide].image} 
                  alt={featuredProducts[currentSlide].name}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-[15000ms] ease-out group-hover:scale-110"
                />
                {/* Refined Glass Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent z-10" />
                <div className="absolute inset-0 backdrop-blur-[1px] z-5 opacity-30" />
                <div className="absolute inset-0 bg-white/5 z-10" />
              </div>

              {/* Content Overlay - Shifted to Left for Premium Feel */}
              <div className="relative z-20 h-full flex items-center px-8 lg:px-40">
                <div className="max-w-4xl">
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="px-3 py-1 bg-black text-white text-[8px] font-akina font-black uppercase tracking-[0.2em] rounded-sm">New</div>
                      <span className="text-[10px] font-akina font-bold uppercase tracking-[0.5em] text-black/30">
                        Featured {featuredProducts[currentSlide].category}
                      </span>
                    </div>
                    
                    <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] font-akina font-black leading-[0.85] tracking-tighter mb-6 text-black">
                      {featuredProducts[currentSlide].name}
                    </h2>
                    
                    <p className="text-base lg:text-lg text-black/50 mb-10 leading-relaxed font-akina font-medium max-w-xl">
                      {featuredProducts[currentSlide].description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-12">
                      <Link 
                        href={`/products/${featuredProducts[currentSlide].id}`}
                        className="group/btn relative px-14 py-6 bg-black text-white rounded-full overflow-hidden font-akina font-bold text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500"
                      >
                        <span className="relative z-10">Experience Now</span>
                        <div className="absolute inset-0 bg-[#FF8C00] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                      </Link>
                      <div className="flex flex-col">
                        <span className="text-black/20 text-[10px] font-akina font-bold uppercase tracking-widest mb-2">Price Starting At</span>
                        <span className="text-4xl font-akina font-black text-black tracking-tight">{featuredProducts[currentSlide].price.toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation Group (Arrows + Dots) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8 bg-white/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-sm">
            <button 
              onClick={prevSlide}
              className="group/btn text-black/40 hover:text-black transition-all duration-500"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2px]" />
            </button>

            <div className="flex gap-2">
              {featuredProducts.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-black w-6' : 'bg-black/10'}`} 
                />
              ))}
            </div>

            <button 
              onClick={nextSlide}
              className="group/btn text-black/40 hover:text-black transition-all duration-500"
            >
              <ArrowRight className="w-5 h-5 stroke-[2px]" />
            </button>
          </div>
        </section>

        {/* Search & Filters Container */}
        <div className="w-full max-w-[1440px] mx-auto px-6 mb-24 mt-12">
          
          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start mb-10">
            {['all', 'ai', 'office', 'design', 'os'].map((tag, idx) => {
              const isActive = searchQuery.toLowerCase() === tag || (searchQuery === '' && tag === 'all');
              return (
                <React.Fragment key={tag}>
                  {idx > 0 && <span className="text-black/10 font-light mx-1">|</span>}
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchQuery(tag === 'all' ? '' : tag)}
                    className={`relative px-5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/90 text-black shadow-md shadow-black/5' 
                        : 'bg-transparent text-black/30 hover:text-black hover:bg-white/40'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeBlur"
                        className="absolute inset-0 rounded-full bg-black/[0.02] backdrop-blur-[4px]"
                      />
                    )}
                    <span className="relative z-10">{tag}</span>
                  </motion.button>
                </React.Fragment>
              );
            })}
          </div>
          
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
