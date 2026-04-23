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
        </div>
      </main>
    </div>
  );
}
