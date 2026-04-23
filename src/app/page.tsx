import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import HomeClient from "@/components/HomeClient";

// Force dynamic because we want the latest products/banners
export const dynamic = "force-dynamic";

async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function getBanners() {
  return await prisma.banner.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export default async function Home() {
  let products: any[] = [];
  let banners: any[] = [];

  try {
    const [p, b] = await Promise.all([
      getProducts(),
      getBanners(),
    ]);
    products = p;
    banners = b;
  } catch (error) {
    console.error("Database connection error:", error);
    // Return empty state or handle accordingly
  }

  const bestSellers = products.filter((p) => p.isBestSeller);

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="pt-20 md:pt-32 pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <HomeClient initialProducts={products} banners={banners} />
          
          {/* Best Sellers Section - Server Rendered for initial speed */}
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
        </div>
      </main>
    </div>
  );
}
