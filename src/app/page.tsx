import HomeClient from "@/components/HomeClient";
import { getBanners, getCategoryConfig, getProducts } from "@/lib/storefront";
import type { Product } from "@/lib/data";

export const revalidate = 300;

function serializeProduct(product: Product): Product {
  return {
    ...product,
    flashSaleStartsAt:
      product.flashSaleStartsAt instanceof Date
        ? product.flashSaleStartsAt.toISOString()
        : product.flashSaleStartsAt,
    flashSaleEndsAt:
      product.flashSaleEndsAt instanceof Date ? product.flashSaleEndsAt.toISOString() : product.flashSaleEndsAt,
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
  };
}

export default async function Home() {
  let products: Product[] = [];
  let banners: any[] = [];
  let categories: string[] = [];

  try {
    const [p, b, c] = await Promise.all([
      getProducts(),
      getBanners(),
      getCategoryConfig(),
    ]);
    products = p.map((product) => serializeProduct(product as Product));
    banners = b;
    categories = c;
  } catch (error) {
    console.error("Database connection error:", error);
  }

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <HomeClient initialProducts={products} banners={banners} categories={categories} />
        </div>
      </main>
    </div>
  );
}
