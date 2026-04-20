"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
          console.error("API Error or invalid data format:", data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="pt-20 md:pt-32 pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-paper/40 hover:text-paper transition-colors mb-4 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Quay lại trang chủ</span>
              </Link>
              <h1 className="text-3xl md:text-5xl font-montserrat font-bold text-paper uppercase tracking-tighter">
                Danh mục: <span className="text-[#FF8C00]">{slug === 'all' ? 'Tất cả' : slug}</span>
              </h1>
              <div className="h-1.5 w-24 bg-[#FF8C00] mt-4 rounded-full" />
            </div>
            
            <div className="text-[10px] md:text-sm font-bold border border-paper/20 px-4 py-2 rounded-full text-paper/60 uppercase tracking-widest bg-paper/5 backdrop-blur-md">
              {products.length} sản phẩm tìm thấy
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="py-32 text-center">
              <div className="w-12 h-12 border-4 border-[#FF8C00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-paper/30">Đang tải sản phẩm...</p>
            </div>
          ) : (
            <>
              <motion.div 
                layout
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {products.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "circOut"
                      }}
                    >
                      <ProductCard product={product} index={idx} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {products.length === 0 && (
                <div className="py-32 text-center flex flex-col items-center gap-6">
                  <Search className="w-16 h-16 text-paper/10" />
                  <div className="font-montserrat text-2xl text-paper/40 font-bold uppercase tracking-widest">
                    Chưa có sản phẩm trong danh mục này.
                  </div>
                  <Link 
                    href="/"
                    className="px-8 py-3 bg-paper text-asphalt rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all"
                  >
                    Khám phá sản phẩm khác
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
