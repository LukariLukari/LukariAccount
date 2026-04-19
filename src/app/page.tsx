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
        MINIMALIST NAVBAR
        ========================================================================
      */}
      <nav className="fixed top-0 w-full z-[100] backdrop-blur-md bg-white/50 border-b border-black/5">
        <div className="max-w-[1440px] mx-auto px-12 h-16 flex items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-akina font-black text-xl shadow-lg">
              L
            </div>
            <span className="font-akina font-black tracking-tighter text-2xl hidden sm:block">LukariAccount</span>
          </Link>

          {/* Search Bar in Header */}
          <div className="flex-1 max-w-md relative group">
            <input 
              type="text" 
              placeholder="Search software, accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/[0.03] border border-black/5 rounded-full px-10 py-2.5 text-[11px] font-akina font-bold focus:outline-none focus:bg-white focus:shadow-sm transition-all placeholder:text-black/20"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/20 group-focus-within:text-black transition-colors" />
          </div>

          <div className="hidden md:flex items-center gap-8 shrink-0">
            {['Products', 'Prices'].map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`} 
                className="text-[10px] font-akina font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
              >
                {item}
              </Link>
            ))}
          </div>

          <Link href="/cart" className="relative group shrink-0">
            <ShoppingBag className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center rounded-full font-akina font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* 
        ========================================================================
        HERO CAROUSEL (REDUCED SIZE + AUTO SLIDE)
        ========================================================================
      */}
      <main className="pt-16">
        <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden flex items-center bg-white group">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="absolute inset-0 w-full h-full flex flex-col lg:flex-row"
            >
              {/* Left Content Area - Clean & Minimal */}
              <div className="w-full lg:w-[50%] h-full flex items-center px-12 lg:pl-24 bg-white relative z-20">
                <div className="max-w-xl">
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-[10px] font-akina font-black uppercase tracking-[0.3em] text-black/30">
                        Featured {featuredProducts[currentSlide].category}
                      </span>
                      <div className="h-[1px] w-8 bg-black/10" />
                    </div>
                    
                    <h2 className="text-[clamp(3rem,5vw,5rem)] font-akina font-black leading-[0.9] tracking-tighter mb-8 text-black">
                      {featuredProducts[currentSlide].name}
                    </h2>
                    
                    <p className="text-lg text-black/40 mb-12 leading-relaxed font-akina font-medium max-w-lg">
                      {featuredProducts[currentSlide].description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                      <Link 
                        href={`/products/${featuredProducts[currentSlide].id}`}
                        className="px-10 py-4 bg-black text-white rounded-full shadow-2xl shadow-black/20 font-akina font-bold text-[10px] uppercase tracking-widest hover:bg-[#FF8C00] hover:-translate-y-1 transition-all duration-500"
                      >
                        Get Started
                      </Link>
                      <div className="flex flex-col">
                        <span className="text-black/20 text-[9px] font-akina font-bold uppercase tracking-widest mb-1">Pricing</span>
                        <span className="text-xl font-akina font-black text-black">{featuredProducts[currentSlide].price.toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Visual Area - Immersive Image */}
              <div className="w-full lg:w-[50%] h-full relative overflow-hidden bg-white">
                {/* Background Pattern/Blur - Subtle Glow Only */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[80%] bg-black/[0.02] blur-[120px] rounded-full" />
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <motion.div
                    initial={{ scale: 0.8, x: 50, opacity: 0 }}
                    animate={{ scale: 1, x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1, type: "spring", bounce: 0.3 }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <img 
                      src={featuredProducts[currentSlide].image} 
                      alt={featuredProducts[currentSlide].name}
                      className="relative z-10 w-full max-w-[750px] h-auto max-h-[85%] object-contain rounded-[2.5rem] drop-shadow-[0_40px_70px_rgba(0,0,0,0.12)] group-hover:scale-[1.03] transition-transform duration-1000"
                    />
                  </motion.div>
                </div>

                {/* Background Large Category Text */}
                <div className="absolute bottom-12 right-12 opacity-[0.02] pointer-events-none select-none">
                  <span className="text-[10vw] font-akina font-black italic uppercase leading-none">
                    {featuredProducts[currentSlide].category}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows - Minimalist Style */}
          <button 
            onClick={prevSlide}
            className="absolute left-10 z-30 group/btn flex items-center gap-2 text-black/20 hover:text-black transition-all duration-500"
          >
            <motion.div whileHover={{ x: -5 }}>
              <ArrowLeft className="w-8 h-8 stroke-[1px]" />
            </motion.div>
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-10 z-30 group/btn flex items-center gap-2 text-black/20 hover:text-black transition-all duration-500"
          >
            <motion.div whileHover={{ x: 5 }}>
              <ArrowRight className="w-8 h-8 stroke-[1px]" />
            </motion.div>
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {featuredProducts.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-black w-6' : 'bg-black/10'}`} 
              />
            ))}
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
