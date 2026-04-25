"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/data";

interface CategoryProductsClientProps {
  products: Product[];
  categories: string[];
  initialCategory: string;
}

const ALL_CATEGORIES_LABEL = "Tất cả";

function normalizeCategory(category: string) {
  return category.trim().toLowerCase();
}

function getCategoryFromPath(categories: string[], fallback: string) {
  const pathSegment = window.location.pathname.split("/").filter(Boolean).pop();
  if (!pathSegment) return fallback;

  const decoded = decodeURIComponent(pathSegment);
  if (normalizeCategory(decoded) === "all") return ALL_CATEGORIES_LABEL;

  return categories.find((category) => normalizeCategory(category) === normalizeCategory(decoded)) ?? fallback;
}

export default function CategoryProductsClient({
  products,
  categories,
  initialCategory,
}: CategoryProductsClientProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const categoryOptions = useMemo(() => [ALL_CATEGORIES_LABEL, ...categories], [categories]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES_LABEL) return products;

    return products.filter(
      (product) => normalizeCategory(product.category) === normalizeCategory(activeCategory)
    );
  }, [activeCategory, products]);

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    const nextPath =
      category === ALL_CATEGORIES_LABEL
        ? "/categories/all"
        : `/categories/${encodeURIComponent(category)}`;
    window.history.pushState(null, "", nextPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveCategory(getCategoryFromPath(categories, initialCategory));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [categories, initialCategory]);

  return (
    <>
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
            Danh mục: <span className="text-[#FF8C00]">{activeCategory}</span>
          </h1>
          <div className="h-1.5 w-24 bg-[#FF8C00] mt-4 rounded-full" />
        </div>

        <div className="text-[10px] md:text-sm font-bold border border-paper/20 px-4 py-2 rounded-full text-paper/60 uppercase tracking-widest bg-paper/5 backdrop-blur-md">
          {filteredProducts.length} sản phẩm tìm thấy
        </div>
      </div>

      <div className="mb-10">
        <p className="text-[10px] font-montserrat font-bold uppercase tracking-[0.24em] text-paper/25 mb-4">
          Chuyển danh mục
        </p>
        <div className="flex flex-wrap gap-2.5">
          {categoryOptions.map((category) => {
            const isActive = normalizeCategory(category) === normalizeCategory(activeCategory);

            return (
              <button
                key={category}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => selectCategory(category)}
                className={`rounded-full border px-4 py-2.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.18em] transition-all ${
                  isActive
                    ? "border-[#FF8C00] bg-[#FF8C00] text-asphalt"
                    : "border-paper/10 bg-paper/5 text-paper/45 hover:border-paper/25 hover:bg-paper/10 hover:text-paper"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center flex flex-col items-center gap-6">
          <Search className="w-16 h-16 text-paper/10" />
          <div className="font-montserrat text-2xl text-paper/40 font-bold uppercase tracking-widest">
            Chưa có sản phẩm trong danh mục này.
          </div>
          <button
            type="button"
            onClick={() => selectCategory(ALL_CATEGORIES_LABEL)}
            className="px-8 py-3 bg-paper text-asphalt rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all"
          >
            Khám phá sản phẩm khác
          </button>
        </div>
      )}
    </>
  );
}
