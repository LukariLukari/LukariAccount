import HomeClient from "@/components/HomeClient";
import { getBanners, getCategoryConfig, getProducts } from "@/lib/storefront";

export const revalidate = 300;

export default async function Home() {
  let products: any[] = [];
  let banners: any[] = [];
  let categories: string[] = [];

  try {
    const [p, b, c] = await Promise.all([
      getProducts(),
      getBanners(),
      getCategoryConfig(),
    ]);
    products = p;
    banners = b;
    categories = c;
  } catch (error) {
    console.error("Database connection error:", error);
  }

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="pt-20 md:pt-32 pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <HomeClient initialProducts={products} banners={banners} categories={categories} />
        </div>
      </main>
    </div>
  );
}
