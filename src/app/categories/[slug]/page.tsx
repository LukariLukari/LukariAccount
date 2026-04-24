import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getBaseUrl, getProducts, getProductsByCategory } from "@/lib/storefront";

export const revalidate = 300;

function formatCategoryTitle(slug: string) {
  const decoded = decodeURIComponent(slug);
  if (decoded.toLowerCase() === "all") return "Tất cả";
  return decoded;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = formatCategoryTitle(slug);
  const title = `${categoryName} | LukariAccount`;
  const description = `Khám phá các sản phẩm thuộc danh mục ${categoryName} tại LukariAccount.`;
  const url = `${getBaseUrl()}/categories/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

export default async function CategoryPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const categoryName = formatCategoryTitle(slug);
  const products = slug.toLowerCase() === "all" ? await getProducts() : await getProductsByCategory(slug);

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="pt-20 md:pt-32 pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
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
                Danh mục: <span className="text-[#FF8C00]">{categoryName}</span>
              </h1>
              <div className="h-1.5 w-24 bg-[#FF8C00] mt-4 rounded-full" />
            </div>

            <div className="text-[10px] md:text-sm font-bold border border-paper/20 px-4 py-2 rounded-full text-paper/60 uppercase tracking-widest bg-paper/5 backdrop-blur-md">
              {products.length} sản phẩm tìm thấy
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center flex flex-col items-center gap-6">
              <Search className="w-16 h-16 text-paper/10" />
              <div className="font-montserrat text-2xl text-paper/40 font-bold uppercase tracking-widest">
                Chưa có sản phẩm trong danh mục này.
              </div>
              <Link
                href="/products"
                className="px-8 py-3 bg-paper text-asphalt rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all"
              >
                Khám phá sản phẩm khác
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
