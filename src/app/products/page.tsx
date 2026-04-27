import type { Metadata } from "next";
import ProductsClient from "@/components/ProductsClient";
import { getBaseUrl, getProducts } from "@/lib/storefront";
import type { Product } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tất cả sản phẩm | LukariAccount",
  description: "Khám phá tài khoản, phần mềm bản quyền và các gói hỗ trợ đang có tại LukariAccount.",
  alternates: {
    canonical: `${getBaseUrl()}/products`,
  },
  openGraph: {
    title: "Tất cả sản phẩm | LukariAccount",
    description: "Danh sách sản phẩm tài khoản và phần mềm bản quyền tại LukariAccount.",
    url: `${getBaseUrl()}/products`,
    type: "website",
  },
};

function serializeProduct(product: Product): Product {
  return {
    ...product,
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const products = (await getProducts()).map((product) => serializeProduct(product as Product));
  const initialQuery = typeof params?.q === "string" ? params.q : "";
  const baseUrl = getBaseUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.slice(0, 24).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/products/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductsClient initialProducts={products} initialQuery={initialQuery} />
    </>
  );
}
