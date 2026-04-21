"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthStatus from "./AuthStatus";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileSearchOpen(false);
    }
  };

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  return (
    <nav className="fixed top-4 md:top-6 left-0 right-0 z-[100] px-4 md:px-6">
      <div className="max-w-7xl mx-auto relative">
        <div className="backdrop-blur-2xl bg-paper/5 border border-paper/10 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4)] px-4 sm:px-10 h-16 md:h-18 flex items-center justify-between gap-4 md:gap-6 transition-all duration-500 hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 group">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-paper rounded-full flex items-center justify-center text-asphalt font-montserrat font-bold text-lg md:text-xl shadow-xl group-hover:scale-110 transition-all duration-500 active:scale-95">
              L
            </div>
            <span className="font-montserrat font-bold text-xl md:text-2xl tracking-tighter text-paper hidden sm:block uppercase">
              Lukari<span className="hidden lg:inline">Account</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-sm hidden md:block">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-12 pr-6 rounded-full bg-paper/[0.05] border border-transparent focus:border-paper/20 focus:bg-paper/10 font-akina text-[11px] uppercase tracking-wider focus:outline-none transition-all text-paper placeholder:text-paper/20"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/20 group-focus-within:text-paper transition-colors">
                <Search className="w-4 h-4" />
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-6 shrink-0">
            <div className="hidden lg:flex items-center gap-6 mr-2">
              {[{label: 'Products', href: '/products'}, {label: 'Tài nguyên', href: '/resources'}].map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/30 hover:text-paper transition-all relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-paper transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Mobile Search Toggle */}
            <button 
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                setIsMobileMenuOpen(false);
              }}
              className="md:hidden p-2 text-paper/40 hover:text-paper hover:bg-paper/5 transition-all rounded-full"
            >
              {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            
            <AuthStatus />
            
            <Link href="/cart" className="p-2 md:p-3 text-paper/40 hover:text-paper hover:bg-paper/5 transition-all rounded-full relative group">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 md:top-2 right-1 md:right-2 w-4 h-4 bg-paper text-asphalt text-[8px] flex items-center justify-center rounded-full font-montserrat font-bold ring-2 ring-asphalt shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {/* Hamburger Menu Toggle */}
            <button 
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsMobileSearchOpen(false);
              }}
              className="md:hidden p-2 text-paper/40 hover:text-paper hover:bg-paper/5 transition-all rounded-full"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 left-0 right-0 z-50 md:hidden"
            >
              <form onSubmit={handleSearch} className="relative w-full">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Nhập từ khóa tìm kiếm..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-14 pr-6 rounded-3xl bg-[#1a1a1a] border border-paper/10 shadow-2xl font-montserrat font-bold text-xs uppercase tracking-wider outline-none text-paper placeholder:text-paper/20"
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FF8C00]">
                  <Search className="w-5 h-5" />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-20 left-0 right-0 z-50 md:hidden overflow-hidden"
            >
              <div className="bg-[#1a1a1a] border border-paper/10 rounded-[2.5rem] shadow-2xl p-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-montserrat font-bold uppercase tracking-[0.3em] text-paper/20">Menu chính</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[{label: 'Products', href: '/products'}, {label: 'Tài nguyên', href: '/resources'}, {label: 'Cart', href: '/cart'}, {label: 'Profile', href: '/profile'}].map((item) => (
                      <Link 
                        key={item.label}
                        href={item.href}
                        className="flex items-center justify-between p-5 rounded-2xl bg-paper/5 border border-paper/5 hover:bg-paper/10 transition-all group"
                      >
                        <span className="text-[11px] font-montserrat font-bold uppercase tracking-widest text-paper/60 group-hover:text-paper">{item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-paper/20 group-hover:text-paper group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-montserrat font-bold uppercase tracking-[0.3em] text-paper/20">Danh mục phổ biến</h3>
                  <div className="flex flex-wrap gap-2">
                    {['AI', 'Office', 'Design', 'OS', 'Video', 'Combo iOS'].map((cat) => (
                      <Link 
                        key={cat}
                        href={`/categories/${cat.toLowerCase()}`}
                        className="px-4 py-2 rounded-full bg-paper/5 border border-paper/5 text-[9px] font-montserrat font-bold uppercase tracking-widest text-paper/40 hover:bg-[#FF8C00] hover:text-asphalt hover:border-[#FF8C00] transition-all"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
