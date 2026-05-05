import type { Metadata } from "next";
import CategoryProductsClient from "@/components/CategoryProductsClient";
import { getBaseUrl, getCategoryConfig, getProducts } from "@/lib/storefront";
import type { Product } from "@/lib/data";

export const revalidate = 300;

function formatCategoryTitle(slug: string) {
  const decoded = decodeURIComponent(slug);
  if (decoded.toLowerCase() === "all") return "Tất cả";
  return decoded;
}

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
  const categories = await getCategoryConfig();
  const decodedSlug = decodeURIComponent(slug);
  const activeCategory =
    decodedSlug.toLowerCase() === "all"
      ? "Tất cả"
      : categories.find((category) => category.toLowerCase() === decodedSlug.toLowerCase()) ?? formatCategoryTitle(slug);
  const products = (await getProducts()).map((product) => serializeProduct(product as Product));

  return (
    <div className="min-h-screen bg-asphalt text-paper font-sans selection:bg-paper selection:text-asphalt">
      <main className="pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <CategoryProductsClient
            products={products}
            categories={categories}
            initialCategory={activeCategory}
          />
        </div>
      </main>
    </div>
  );
}
