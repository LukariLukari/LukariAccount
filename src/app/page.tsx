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
        MOBILE-OPTIMIZED FLOATING NAVBAR (Bottom on Mobile, Top on Desktop)
        ========================================================================
      */}
      <nav className="fixed bottom-6 md:bottom-auto md:top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-[100]">
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-20 left-0 right-0 bg-white/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 p-8 shadow-2xl z-[101] flex flex-col gap-6 items-center"
            >
              {['Products', 'Prices', 'Contact', 'FAQ'].map((item) => (
                <Link 
                  key={item} 
                  href={`/${item.toLowerCase()}`} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-akina font-black uppercase tracking-[0.2em] text-black/80 hover:text-black transition-colors"
                >
                  {item}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="backdrop-blur-2xl bg-white/70 border border-white/20 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-500">
          <div className="px-5 sm:px-10 h-16 flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-akina font-black text-xl shadow-xl group-hover:scale-110 transition-transform duration-500">
                L
              </div>
              <span className="font-akina font-black tracking-tighter text-xl hidden lg:block">LukariAccount</span>
            </Link>

            {/* Search Section - Responsive */}
            <div className="flex-1 flex justify-center md:justify-start max-w-sm relative group">
              <div className="hidden md:block w-full relative">
                <input 
                  type="text" 
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/[0.03] border border-black/5 rounded-full px-10 py-2.5 text-[11px] font-akina font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all placeholder:text-black/20"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/20 group-focus-within:text-black transition-colors" />
              </div>
              <button className="md:hidden p-3 hover:bg-black/5 rounded-full transition-colors">
                <Search className="w-5 h-5 text-black/60" />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-8 shrink-0">
              <div className="hidden sm:flex items-center gap-6">
                {['Products', 'Prices'].map((item) => (
                  <Link 
                    key={item} 
                    href={`/${item.toLowerCase()}`} 
                    className="text-[9px] font-akina font-bold uppercase tracking-widest text-black/40 hover:text-black transition-all relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all group-hover:w-full" />
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <Link href="/cart" className="relative group shrink-0 p-3 hover:bg-black/5 rounded-full transition-colors">
                  <ShoppingBag className="w-5 h-5 text-black/60 group-hover:text-black transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-black text-white text-[8px] flex items-center justify-center rounded-full font-akina font-black ring-2 ring-white">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Mobile Hamburger Menu Toggle */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-3 hover:bg-black/5 rounded-full transition-colors relative z-[102]"
                >
                  {isMenuOpen ? <X className="w-6 h-6 text-black" /> : <MenuIcon className="w-6 h-6 text-black/60" />}
                </button>
              </div>
            </div>
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
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) prevSlide();
                else if (info.offset.x < -100) nextSlide();
              }}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
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

              {/* Content Overlay - Mobile Optimized Alignment */}
              <div className="relative z-20 h-full flex items-center px-6 lg:px-20">
                <div className="max-w-4xl text-left">
                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center gap-4 mb-4 md:mb-6">
                      <div className="px-3 py-1 bg-black text-white text-[7px] md:text-[8px] font-akina font-black uppercase tracking-[0.2em] rounded-sm">New</div>
                      <span className="text-[9px] md:text-[10px] font-akina font-bold uppercase tracking-[0.4em] text-black/30">
                        Featured {featuredProducts[currentSlide].category}
                      </span>
                    </div>
                    
                    <h2 className="text-[clamp(2rem,8vw,4.5rem)] font-akina font-black leading-[0.85] tracking-tighter mb-4 md:mb-6 text-black">
                      {featuredProducts[currentSlide].name}
                    </h2>
                    
                    <p className="text-sm md:text-lg text-black/50 mb-8 md:mb-10 leading-relaxed font-akina font-medium max-w-sm md:max-w-xl">
                      {featuredProducts[currentSlide].description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 md:gap-12">
                      <Link 
                        href={`/products/${featuredProducts[currentSlide].id}`}
                        className="group/btn relative px-10 md:px-14 py-5 md:py-6 bg-black text-white rounded-full overflow-hidden font-akina font-bold text-[10px] md:text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500"
                      >
                        <span className="relative z-10">Experience Now</span>
                        <div className="absolute inset-0 bg-[#FF8C00] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                      </Link>
                      <div className="flex flex-col">
                        <span className="text-black/20 text-[9px] md:text-[10px] font-akina font-bold uppercase tracking-widest mb-1 md:mb-2">Price Starting At</span>
                        <span className="text-2xl md:text-4xl font-akina font-black text-black tracking-tight">{featuredProducts[currentSlide].price.toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Control - Responsive (Arrows on Desktop, Dots on all) */}
          <div className="absolute bottom-10 md:bottom-12 right-6 md:right-12 z-30 flex items-center gap-4 md:gap-6 bg-white/40 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/20 shadow-sm">
            <motion.button 
              whileHover={{ scale: 1.2, backgroundColor: "rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              className="hidden md:flex p-2 rounded-full text-black/40 hover:text-black transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
            </motion.button>

            <div className="flex gap-1.5 md:gap-2">
              {featuredProducts.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-black w-4 md:w-6' : 'bg-black/10'}`} 
                />
              ))}
            </div>

            <motion.button 
              whileHover={{ scale: 1.2, backgroundColor: "rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              className="hidden md:flex p-2 rounded-full text-black/40 hover:text-black transition-colors duration-300"
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
            </motion.button>
          </div>
        </section>

        {/* Search & Filters Container */}
        <div className="w-full max-w-[1440px] mx-auto px-6 mb-24 mt-12">
          
          {/* Quick Filters - Mobile Scrollable */}
          <div className="flex justify-center md:justify-start mb-10 -mx-6 px-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 flex-nowrap">
              {['all', 'ai', 'office', 'design', 'os'].map((tag, idx) => {
                const isActive = searchQuery.toLowerCase() === tag || (searchQuery === '' && tag === 'all');
                return (
                  <React.Fragment key={tag}>
                    {idx > 0 && <span className="text-black/5 font-light shrink-0">|</span>}
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchQuery(tag === 'all' ? '' : tag)}
                      className={`relative px-4 md:px-5 py-2 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-300 shrink-0 ${
                        isActive 
                          ? 'bg-white text-black shadow-md shadow-black/5' 
                          : 'bg-transparent text-black/25 hover:text-black hover:bg-white/40'
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
