"use client";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProductList() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  return (
    <>
      {query && (
        <div className="mb-6 p-4 bg-secondary border border-border rounded-lg text-foreground">
          Kết quả tìm kiếm cho: <span className="font-bold text-primary">"{query}"</span>
          <span className="ml-2 text-sm text-muted-foreground">({filteredProducts.length} kết quả)</span>
        </div>
      )}
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary border border-border rounded-lg">
          <p className="text-muted-foreground text-lg mb-4">Không tìm thấy sản phẩm nào phù hợp.</p>
          <a href="/products" className="text-cta font-medium hover:underline">Xem tất cả sản phẩm</a>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          {/* Breadcrumb */}
          <div className="text-[10px] font-akina font-bold uppercase tracking-widest text-black/30 mb-10 flex items-center gap-3">
            <a href="/" className="hover:text-black transition-colors">LukariAccount</a>
            <span className="opacity-20">/</span>
            <span className="text-black">Products</span>
          </div>

          <h1 className="text-4xl font-akina font-black text-black mb-12 tracking-tighter">All Products</h1>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Filter */}
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-secondary border border-border rounded-lg p-6 sticky top-24 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                <ul className="space-y-3">
                  <li><a href="/products" className="text-primary font-medium">All Categories</a></li>
                  <li><a href="/products?q=ai" className="text-muted-foreground hover:text-primary">AI</a></li>
                  <li><a href="/products?q=office" className="text-muted-foreground hover:text-primary">Office</a></li>
                  <li><a href="/products?q=design" className="text-muted-foreground hover:text-primary">Design</a></li>
                  <li><a href="/products?q=os" className="text-muted-foreground hover:text-primary">OS</a></li>
                  <li><a href="/products?q=ios" className="text-muted-foreground hover:text-primary">Combo iOS</a></li>
                </ul>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
              <Suspense fallback={<div>Đang tải danh sách...</div>}>
                <ProductList />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
