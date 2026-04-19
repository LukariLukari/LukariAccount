"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 bg-black flex items-center justify-center text-white font-akina font-black text-xl rounded-xl shadow-lg">
            L
          </div>
          <span className="font-akina font-black text-2xl tracking-tighter text-black hidden sm:block">
            LukariAccount
          </span>
        </Link>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <form onSubmit={handleSearch} className="relative w-full">
            <input 
              type="text" 
              placeholder="Tìm kiếm phần mềm, ứng dụng..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-10 rounded-full border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-black"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button className="sm:hidden p-2 text-secondary-foreground hover:text-primary transition-colors rounded-full hover:bg-black/5">
            <Search className="w-5 h-5" />
          </button>
          
          <Link href="/cart" className="p-2 text-secondary-foreground hover:text-primary transition-colors rounded-full hover:bg-black/5 relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-cta text-cta-foreground rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2 text-secondary-foreground hover:text-primary transition-colors rounded-full hover:bg-black/5">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
