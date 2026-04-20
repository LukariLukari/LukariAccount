"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthStatus from "./AuthStatus";
import { motion } from "framer-motion";

export default function Navbar() {
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-[100] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-2xl bg-paper/5 border border-paper/10 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4)] px-5 sm:px-10 h-18 flex items-center justify-between gap-6 transition-all duration-500 hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-paper rounded-full flex items-center justify-center text-asphalt font-akina font-black text-xl shadow-xl group-hover:scale-110 transition-all duration-500 active:scale-95">
              L
            </div>
            <span className="font-akina font-black text-2xl tracking-tighter text-paper hidden lg:block uppercase">
              LukariAccount
            </span>
          </Link>

          {/* Search Bar - Center */}
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
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <div className="hidden lg:flex items-center gap-6 mr-2">
              {['Products', 'Prices'].map((item) => (
                <Link 
                  key={item} 
                  href={`/${item.toLowerCase()}`} 
                  className="text-[10px] font-akina font-black uppercase tracking-widest text-paper/30 hover:text-paper transition-all relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-paper transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>

            <button className="md:hidden p-2.5 text-paper/40 hover:text-paper hover:bg-paper/5 transition-all rounded-full">
              <Search className="w-5 h-5" />
            </button>
            
            <AuthStatus />
            
            <Link href="/cart" className="p-3 text-paper/40 hover:text-paper hover:bg-paper/5 transition-all rounded-full relative group">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-paper text-asphalt text-[8px] flex items-center justify-center rounded-full font-akina font-black ring-2 ring-asphalt shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
            
            <button className="md:hidden p-2.5 text-paper/40 hover:text-paper hover:bg-paper/5 transition-all rounded-full">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
