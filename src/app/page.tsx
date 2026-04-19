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
        <section className="relative h-[70vh] min-h-[550px] w-full overflow-hidden bg-black group">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Full Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={featuredProducts[currentSlide].image} 
                  alt={featuredProducts[currentSlide].name}
                  className="w-full h-full object-cover opacity-80 transition-transform duration-[10000ms] ease-linear group-hover:scale-110"
                />
                {/* Gradient Overlays for Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
              </div>

              {/* Centered Content Overlay */}
              <div className="relative z-20 h-full flex items-center px-8 lg:px-24">
                <div className="max-w-3xl">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[10px] font-akina font-black uppercase tracking-[0.4em] text-white/60">
                        Featured {featuredProducts[currentSlide].category}
                      </span>
                      <div className="h-[1px] w-10 bg-white/20" />
                    </div>
                    
                    <h2 className="text-[clamp(2.5rem,8vw,5.5rem)] font-akina font-black leading-[0.9] tracking-tighter mb-8 text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                      {featuredProducts[currentSlide].name}
                    </h2>
                    
                    <p className="text-base lg:text-lg text-white/70 mb-12 leading-relaxed font-akina font-medium max-w-xl drop-shadow-md">
                      {featuredProducts[currentSlide].description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10">
                      <Link 
                        href={`/products/${featuredProducts[currentSlide].id}`}
                        className="px-12 py-5 bg-white text-black rounded-full shadow-[0_15px_30px_rgba(255,255,255,0.2)] font-akina font-bold text-[11px] uppercase tracking-widest hover:bg-[#FF8C00] hover:text-white hover:-translate-y-1 transition-all duration-500"
                      >
                        Get Started
                      </Link>
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[9px] font-akina font-bold uppercase tracking-widest mb-1">Price Start From</span>
                        <span className="text-3xl font-akina font-black text-white drop-shadow-lg">{featuredProducts[currentSlide].price.toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows - High Contrast */}
          <button 
            onClick={prevSlide}
            className="absolute left-8 z-30 group/btn text-white/30 hover:text-white transition-all duration-500"
          >
            <motion.div whileHover={{ x: -5 }}>
              <ArrowLeft className="w-10 h-10 stroke-[1px]" />
            </motion.div>
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-8 z-30 group/btn text-white/30 hover:text-white transition-all duration-500"
          >
            <motion.div whileHover={{ x: 5 }}>
              <ArrowRight className="w-10 h-10 stroke-[1px]" />
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
