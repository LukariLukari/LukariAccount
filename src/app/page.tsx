"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag, Search, Menu as MenuIcon, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useMemo, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/data";

export default function Home() {
  const { cartCount, addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Featured products for carousel
  const featuredProducts = useMemo(() => dbProducts.slice(0, 4), [dbProducts]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setDbProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Auto-slide effect
  React.useEffect(() => {
    if (featuredProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return dbProducts;
    return dbProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [searchQuery, dbProducts]);

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      {/* 
        ========================================================================
        HERO SECTION: SIDEBAR + BANNER
        ========================================================================
      */}
      <main className="pt-20 md:pt-32 pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
            
            {/* Sidebar: Categories - Hidden on Mobile */}
            <aside className="hidden md:block w-[320px] shrink-0 h-[420px]">
              <div className="bg-paper/5 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-7 shadow-2xl border border-paper/10 h-full flex flex-col overflow-hidden">
                <h2 className="font-montserrat font-bold text-[9px] uppercase tracking-[0.4em] mb-6 text-paper/30 flex items-center gap-2.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-paper/10" />
                  Danh mục
                </h2>
                
                <nav className="flex flex-col gap-1.5 overflow-y-auto scrollbar-hide pr-1">
                  {['all', 'ai', 'office', 'design', 'os', 'video', 'combo ios'].map((tag) => {
                    const isActive = searchQuery.toLowerCase() === tag || (searchQuery === '' && tag === 'all');
                    return (
                      <button 
                        key={tag}
                        onClick={() => setSearchQuery(tag === 'all' ? '' : tag)}
                        className="relative group flex items-center justify-between px-6 py-4 rounded-2xl transition-colors duration-300 font-montserrat font-bold text-[10px] uppercase tracking-[0.15em] outline-none"
                      >
                        {/* Gliding Background Indicator */}
                        {isActive && (
                          <motion.div 
                            layoutId="activeCategory"
                            className="absolute inset-0 bg-paper/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-paper/10 rounded-2xl z-0"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        
                        <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-paper' : 'text-paper/40 group-hover:text-paper/60'}`}>
                          {tag}
                        </span>
                        
                        <ArrowRight className={`relative z-10 w-3.5 h-3.5 transition-all duration-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'} ${isActive ? 'text-paper' : 'text-paper/20'}`} />
                      </button>
                    );
                  })}
                </nav>
                
                <div className="mt-auto pt-6 border-t border-paper/5">
                  <div className="bg-paper/[0.02] rounded-[1.25rem] p-4 border border-paper/10">
                    <p className="text-[10px] font-akina font-black text-paper leading-tight">Need help? Contact us.</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Hero Banner */}
            <section className="flex-1 relative h-[240px] sm:h-[320px] md:h-[420px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-asphalt group shadow-2xl border border-paper/10">
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
                {featuredProducts.length > 0 ? (
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
                        src={featuredProducts[currentSlide]?.image || ""} 
                        alt={featuredProducts[currentSlide]?.name || ""}
                        className="w-full h-full object-cover transition-transform duration-[15000ms] ease-out group-hover:scale-110"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-paper/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-paper/20">Đang tải sản phẩm...</p>
                  </div>
                )}
              </AnimatePresence>

              {/* Navigation Control */}
              <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-30 flex items-center gap-3 md:gap-5 bg-paper/10 backdrop-blur-xl px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-paper/20 shadow-2xl">
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(239,237,227,0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevSlide}
                  className="hidden md:flex p-2 rounded-full text-paper/40 hover:text-paper transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
                </motion.button>

                <div className="flex gap-2">
                  {featuredProducts.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentSlide(i)}
                      className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-paper w-4 md:w-6' : 'bg-paper/10'}`} 
                    />
                  ))}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(239,237,227,0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextSlide}
                  className="hidden md:flex p-2 rounded-full text-paper/40 hover:text-paper transition-all duration-300"
                >
                  <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
                </motion.button>
              </div>
            </section>
          </div>
        </div>

        {/* Search Results / Product Grid Section */}
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 mt-16 md:mt-24">
          
          {searchQuery && (
            <div className="mb-6 md:mb-8 flex items-center justify-between border-b border-paper/10 pb-4">
              <h2 className="text-xl md:text-2xl font-montserrat font-bold text-paper">Kết quả cho <span className="font-bold">"{searchQuery}"</span></h2>
              <span className="text-[10px] md:text-sm font-bold border border-paper/20 px-3 md:px-4 py-1 rounded-full text-paper/60">{filteredProducts.length} sản phẩm</span>
            </div>
          )}

          <motion.div 
            layout
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
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
              <Search className="w-12 h-12 text-paper/20" />
              <div className="font-display text-2xl text-paper/40 font-medium">
                No products found.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
