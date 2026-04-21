"use client";

import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/data";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ChevronDown, X, ArrowUpDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Get unique categories from data
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return cats.sort();
  }, [products]);

  // Toggle category
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Filter and sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.some((cat) =>
          p.category.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "default", label: "Mặc định" },
    { value: "price-asc", label: "Giá: Thấp → Cao" },
    { value: "price-desc", label: "Giá: Cao → Thấp" },
    { value: "name-asc", label: "Tên A-Z" },
  ];

  return (
    <main className="min-h-screen bg-asphalt text-paper">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-paper/20 mb-4 flex items-center gap-3">
            <a href="/" className="hover:text-paper transition-colors">
              LukariAccount
            </a>
            <span className="opacity-30">/</span>
            <span className="text-paper/60">Products</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-paper uppercase tracking-tight">
            Tất cả sản phẩm
          </h1>
          <div className="h-1 w-12 bg-[#FF8C00] mt-3 rounded-full" />
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/20" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-paper/5 border border-paper/10 rounded-xl py-3.5 pl-12 pr-6 text-xs font-bold uppercase tracking-widest text-paper outline-none focus:border-paper/30 transition-all placeholder:text-paper/20"
            />
          </div>

          <div className="flex gap-3">
            {/* Sort Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-5 py-3.5 bg-paper/5 border border-paper/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-paper/60 hover:text-paper hover:border-paper/20 transition-all">
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortOptions.find((s) => s.value === sortBy)?.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full mt-2 right-0 bg-[#1a1917] border border-paper/10 rounded-xl shadow-2xl overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[180px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`block w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      sortBy === option.value
                        ? "text-[#FF8C00] bg-[#FF8C00]/10"
                        : "text-paper/40 hover:text-paper hover:bg-paper/5"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3.5 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                showFilters || selectedCategories.length > 0
                  ? "bg-paper !text-asphalt border-paper shadow-xl"
                  : "bg-paper/5 border-paper/10 text-paper/60 hover:text-paper hover:border-paper/20"
              }`}
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${showFilters || selectedCategories.length > 0 ? "text-asphalt" : ""}`} />
              Bộ lọc
              {selectedCategories.length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[#FF8C00] !text-asphalt flex items-center justify-center text-[9px]">
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-paper/5 border border-paper/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-montserrat font-bold uppercase tracking-[0.2em] text-paper/40">
                    Danh mục
                  </h3>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="text-[9px] font-bold uppercase tracking-widest text-[#FF8C00] hover:text-[#FF8C00]/80 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Bỏ chọn tất cả
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    const count = products.filter(
                      (p) => p.category.toLowerCase() === cat.toLowerCase()
                    ).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`group flex items-center gap-2.5 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                          isSelected
                            ? "bg-paper text-asphalt border-paper shadow-lg"
                            : "bg-paper/5 text-paper/40 border-paper/10 hover:text-paper hover:border-paper/20 hover:bg-paper/10"
                        }`}
                      >
                        {/* Custom Checkbox */}
                        <div
                          className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-asphalt border-asphalt"
                              : "border-paper/20 group-hover:border-paper/40"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-2.5 h-2.5 text-paper"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {cat}
                        <span
                          className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-asphalt/10 text-asphalt/60"
                              : "bg-paper/5 text-paper/20"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-paper/30">
            {filteredProducts.length} sản phẩm
            {selectedCategories.length > 0 && ` trong ${selectedCategories.join(", ")}`}
          </p>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-[180px] sm:h-[230px] bg-paper/5 rounded-2xl animate-pulse border border-paper/5"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
          </motion.div>
        ) : (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <Search className="w-12 h-12 text-paper/10" />
            <div className="font-montserrat text-xl text-paper/30 font-bold uppercase tracking-widest">
              Không tìm thấy sản phẩm.
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
                setSortBy("default");
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-[#FF8C00] hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
