import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getBaseUrl, getProductBySlug, getRelatedProducts } from "@/lib/storefront";
import { getEffectiveProductPrice } from "@/lib/product-pricing";
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

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại | LukariAccount",
    };
  }

  const title = `${product.name} | LukariAccount`;
  const description =
    product.description ||
    product.details?.slice(0, 160) ||
    `Mua ${product.name} với chính sách bảo hành rõ ràng tại LukariAccount.`;
  const url = `${getBaseUrl()}/products/${product.slug}`;

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
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category, 4);
  const offerPrice = getEffectiveProductPrice(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.details || "",
    image: product.image ? [product.image] : undefined,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: offerPrice,
      priceCurrency: "VND",
      availability: product.isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${getBaseUrl()}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={serializeProduct(product as Product)}
        relatedProducts={relatedProducts.map((item) => serializeProduct(item as Product))}
      />
    </>
  );
}
