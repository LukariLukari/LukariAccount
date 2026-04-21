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
  const featuredProducts = useMemo(() => {
    const featured = dbProducts.filter(p => p.isFeatured);
    return featured.length > 0 ? featured : dbProducts.slice(0, 4);
  }, [dbProducts]);
  
  // Best seller products for horizontal scroll
  const bestSellers = useMemo(() => dbProducts.filter(p => p.isBestSeller), [dbProducts]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: 'no-store' });
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
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
            
            {/* Sidebar: Categories - Hidden on Mobile */}
            <aside className="hidden md:block w-[300px] shrink-0 h-[420px]">
              <div className="bg-paper/5 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-paper/10 h-full flex flex-col overflow-hidden">
                <h2 className="font-montserrat font-bold text-[9px] uppercase tracking-[0.4em] mb-6 text-paper/30 flex items-center gap-2.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-paper/10" />
                  Danh mục
                </h2>
                
                <nav className="flex flex-col gap-1.5 overflow-y-auto scrollbar-hide pr-1">
                  {['all', 'ai', 'office', 'design', 'os', 'video', 'combo ios'].map((tag) => {
                    return (
                      <motion.div
                        key={tag}
                        whileHover={{ scale: 1.02, x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="px-2"
                      >
                        <Link 
                          href={tag === 'all' ? '/' : `/categories/${tag}`}
                          className="relative group flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-300 font-montserrat font-bold text-[10px] uppercase tracking-[0.15em] outline-none hover:bg-paper/5 hover:text-paper"
                        >
                          <span className="relative z-10 transition-colors duration-300 text-paper/40 group-hover:text-paper">
                            {tag}
                          </span>
                          
                          <ArrowRight className="relative z-10 w-3.5 h-3.5 transition-all duration-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-paper/20 group-hover:text-paper" />
                        </Link>
                      </motion.div>
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

            {/* Hero Banner - Responsive Sliding Carousel */}
            <section className="flex-1 relative aspect-[16/8] sm:aspect-auto sm:h-[260px] md:h-[420px] rounded-[1.25rem] md:rounded-[2.5rem] overflow-hidden bg-asphalt group shadow-2xl border border-paper/10">
              {featuredProducts.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* Slider Track */}
                  <motion.div 
                    className="flex w-full h-full"
                    animate={{ x: `-${currentSlide * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 50) prevSlide();
                      else if (info.offset.x < -50) nextSlide();
                    }}
                  >
                    {featuredProducts.map((product, idx) => (
                      <div key={product.id} className="min-w-full h-full relative flex-shrink-0">
                        <img 
                          src={product.image || ""} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/20 to-transparent opacity-80" />
                        
                        {/* Banner Content Overlay */}
                        <div className="absolute inset-0 p-5 md:p-14 flex flex-col justify-end">
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-[#FF8C00] text-asphalt text-[7px] md:text-[9px] font-bold uppercase tracking-widest rounded-full mb-1.5 md:mb-4 inline-block shadow-lg">
                              {product.isFeatured ? "Sản phẩm nổi bật" : "Hot Deal"}
                            </span>
                            <h2 className="text-base sm:text-2xl md:text-5xl font-montserrat font-bold text-paper uppercase tracking-tighter mb-2 md:mb-6 max-w-xs md:max-w-lg leading-[1.1] drop-shadow-2xl">
                              {product.name}
                            </h2>
                            <Link 
                              href={`/products/${product.slug}`}
                              className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-paper text-asphalt rounded-full font-bold text-[8px] md:text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                            >
                              Mua Ngay <ArrowRight className="w-3 md:w-4 h-3 md:h-4" />
                            </Link>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  {/* Navigation Control */}
                  <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 z-30 flex items-center gap-3 md:gap-5 bg-white/10 backdrop-blur-xl px-3 md:px-5 py-1.5 md:py-2.5 rounded-full border border-white/20 shadow-2xl">
                    <div className="flex gap-1.5 md:gap-2">
                      {featuredProducts.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setCurrentSlide(i)}
                          className={`h-1 md:h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-paper w-4 md:w-8' : 'bg-paper/20 w-1 md:w-1.5'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Desktop Arrows */}
                  <button onClick={prevSlide} className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full items-center justify-center text-paper hover:bg-white/20 transition-all border border-white/10 opacity-0 group-hover:opacity-100">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button onClick={nextSlide} className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full items-center justify-center text-paper hover:bg-white/20 transition-all border border-white/10 opacity-0 group-hover:opacity-100">
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-paper/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-paper/20">Đang tải banner...</p>
                </div>
              )}
            </section>
          </div>

          {/* 
            ========================================================================
            FEATURED PRODUCTS GRID (NEW DEDICATED SECTION)
            ========================================================================
          */}
          {dbProducts.filter(p => p.isFeatured).length > 0 && (
            <div className="w-full mt-12 md:mt-24">
              <div className="mb-6 flex items-end justify-between px-1">
                <div>
                  <h2 className="text-xl md:text-3xl font-montserrat font-bold text-paper uppercase tracking-tight">Sản phẩm nổi bật</h2>
                  <div className="h-1 w-12 bg-[#FF8C00] mt-2 rounded-full shadow-[0_0_10px_#FF8C00]" />
                </div>
                <Link href="/products" className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/40 hover:text-[#FF8C00] transition-colors">
                  Xem tất cả
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {dbProducts.filter(p => p.isFeatured).slice(0, 8).map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            </div>
          )}

          {/* 
            ========================================================================
            BEST SELLERS SLIDER (LƯỚT)
            ========================================================================
          */}
          {bestSellers.length > 0 && (
            <div className="w-full mt-12 md:mt-24">
              <div className="mb-6 flex items-end justify-between px-1">
                <div>
                  <h2 className="text-xl md:text-3xl font-montserrat font-bold text-paper uppercase tracking-tight">Sản phẩm bán chạy</h2>
                  <div className="h-1 w-12 bg-[#FF8C00] mt-2 rounded-full" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-paper/30 hidden sm:block">Vuốt để xem thêm</p>
              </div>
              
              <div className="relative -mx-1">
                <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x snap-mandatory px-1">
                  {bestSellers.map((product, idx) => (
                    <div key={product.id} className="min-w-[180px] sm:min-w-[280px] md:min-w-[320px] snap-start">
                      <ProductCard product={product} index={idx} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results / Product Grid Section */}
          <div className="w-full mt-12 md:mt-16">
            <div className="mb-6 md:mb-8 flex items-center justify-between border-b border-paper/10 pb-4 px-1">
              <h2 className="text-lg md:text-2xl font-montserrat font-bold text-paper uppercase tracking-tight">
                {searchQuery ? `Kết quả cho "${searchQuery}"` : "Tất cả sản phẩm"}
              </h2>
              <span className="text-[9px] md:text-sm font-bold border border-paper/20 px-3 md:px-4 py-1 rounded-full text-paper/60 uppercase tracking-widest">
                {filteredProducts.length} sản phẩm
              </span>
            </div>

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
                <div className="font-display text-2xl text-paper/40 font-medium uppercase tracking-widest">
                  Không tìm thấy sản phẩm.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
