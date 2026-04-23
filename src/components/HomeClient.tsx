"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeClient({ initialProducts, banners }: { initialProducts: any[], banners: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories/config");
        const data = await res.json();
        setCategories(['all', ...data]);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setCategories(['all', 'ai', 'office', 'design', 'os', 'video', 'combo ios']);
      }
    };
    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return initialProducts;
    return initialProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [searchQuery, initialProducts]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
        {/* Sidebar: Categories */}
        <aside className="hidden md:block w-[300px] shrink-0 h-[420px]">
          <div className="bg-paper/5 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-paper/10 h-full flex flex-col overflow-hidden">
            <h2 className="font-montserrat font-bold text-[9px] uppercase tracking-[0.4em] mb-6 text-paper/30 flex items-center gap-2.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-paper/10" />
              Danh mục
            </h2>
            
            <nav className="flex flex-col gap-1.5 overflow-y-auto scrollbar-hide pr-1">
              {categories.map((tag) => (
                <div key={tag} className="px-2">
                  <Link 
                    href={tag === 'all' ? '/' : `/categories/${tag}`}
                    className="relative group flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 font-montserrat font-bold text-[10px] uppercase tracking-[0.15em] outline-none hover:bg-paper/5 hover:text-paper"
                  >
                    <span className="relative z-10 transition-colors duration-200 text-paper/40 group-hover:text-paper capitalize">
                      {tag}
                    </span>
                    <ArrowRight className="relative z-10 w-3.5 h-3.5 transition-all duration-200 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-paper/20" />
                  </Link>
                </div>
              ))}
            </nav>
            
            <div className="mt-auto pt-6 border-t border-paper/5">
              <div className="bg-paper/[0.02] rounded-[1.25rem] p-4 border border-paper/10">
                <p className="text-[10px] font-akina font-black text-paper leading-tight">Need help? Contact us.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Hero Banner */}
        <section className="flex-1 relative aspect-[16/8] sm:aspect-auto sm:h-[260px] md:h-[420px] rounded-[1.25rem] md:rounded-[2.5rem] overflow-hidden bg-asphalt group shadow-2xl border border-paper/10">
          {banners.length > 0 ? (
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image 
                    src={banners[currentSlide].image} 
                    className="object-cover"
                    alt={banners[currentSlide].title || "Banner"}
                    fill
                    priority
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-asphalt/90 via-asphalt/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-center">
                    <div>
                      <span className="px-2 py-0.5 md:px-3 md:py-1 bg-[#FF8C00] text-asphalt text-[7px] md:text-[9px] font-bold uppercase tracking-widest rounded-full mb-1.5 md:mb-4 inline-block">
                        Hot Deal
                      </span>
                      <h2 className="text-base sm:text-2xl md:text-5xl font-montserrat font-bold text-paper uppercase tracking-tighter mb-2 md:mb-6 max-w-xs md:max-w-lg leading-[1.1] drop-shadow-2xl">
                        {banners[currentSlide].title}
                      </h2>
                      <Link 
                        href={banners[currentSlide].link || "/products"}
                        className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-paper text-asphalt rounded-full font-bold text-[8px] md:text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Khám phá ngay <ArrowRight className="w-3 md:w-4 h-3 md:h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="absolute bottom-4 md:bottom-10 left-8 md:left-14 z-30 flex items-center gap-3">
                <div className="flex gap-1.5 md:gap-2">
                  {banners.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-[#FF8C00] w-4 md:w-8' : 'bg-white/20 w-1 md:w-1.5'}`} 
                    />
                  ))}
                </div>
              </div>
              
              <button onClick={prevSlide} className="hidden md:flex absolute right-24 bottom-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full items-center justify-center text-paper hover:bg-white/20 transition-all z-30">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={nextSlide} className="hidden md:flex absolute right-10 bottom-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full items-center justify-center text-paper hover:bg-[#FF8C00] hover:text-asphalt transition-all z-30">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-paper/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-paper/20">Đang tải banner...</p>
            </div>
          )}
        </section>
      </div>

      {/* Product Grid Section */}
      <div className="w-full mt-12 md:mt-16">
        <div className="mb-6 md:mb-8 flex items-center justify-between border-b border-paper/10 pb-4 px-1">
          <h2 className="text-lg md:text-2xl font-montserrat font-bold text-paper uppercase tracking-tight">
            {searchQuery ? `Kết quả cho "${searchQuery}"` : "Tất cả sản phẩm"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-paper/20" />
              <input 
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-paper/5 border border-paper/10 rounded-full py-2 pl-9 pr-4 text-[9px] font-bold uppercase tracking-widest outline-none focus:border-paper/30 transition-all"
              />
            </div>
            <span className="text-[9px] md:text-sm font-bold border border-paper/20 px-3 md:px-4 py-1 rounded-full text-paper/60 uppercase tracking-widest">
              {filteredProducts.length} sản phẩm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map((product, idx) => (
            <div key={product.id}>
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <Search className="w-12 h-12 text-paper/20" />
            <div className="font-display text-2xl text-paper/40 font-medium uppercase tracking-widest">
              Không tìm thấy sản phẩm.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
