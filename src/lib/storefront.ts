import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getJsonFromR2 } from "@/lib/r2-json";
import { normalizeResources } from "@/lib/resources";

const DEFAULT_CATEGORIES = ["AI", "Office", "Design", "OS", "Video", "Combo iOS"];
const CATEGORY_CONFIG_TAG = "category-config";

export const PRODUCT_CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  price: true,
  originalPrice: true,
  billingCycle: true,
  rating: true,
  downloads: true,
  image: true,
  category: true,
  isBestSeller: true,
  isFeatured: true,
  isHidden: true,
  isSoldOut: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

const getCategoryConfigFromR2 = unstable_cache(
  async () => getJsonFromR2("categories_config.json"),
  [CATEGORY_CONFIG_TAG],
  { revalidate: 300, tags: [CATEGORY_CONFIG_TAG] }
);

export { CATEGORY_CONFIG_TAG };

export const getCategoryConfig = cache(async () => {
  const config = await getCategoryConfigFromR2();

  if (Array.isArray(config)) {
    return config;
  }

  if (config && typeof config === "object") {
    return Object.keys(config);
  }

  return DEFAULT_CATEGORIES;
});

export const getProducts = cache(async () => {
  return prisma.product.findMany({
    where: { isHidden: false },
    select: PRODUCT_CARD_SELECT,
    orderBy: { createdAt: "desc" },
  });
});

export const getBanners = cache(async () => {
  return prisma.banner.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
});

export const getProductBySlug = cache(async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  return product && !product.isHidden ? product : null;
});

export const getRelatedProducts = cache(async (productId: string, category: string, limit = 8) => {
  const sameCategoryProducts = await prisma.product.findMany({
    where: {
      isHidden: false,
      id: { not: productId },
      category: {
        equals: category,
        mode: "insensitive",
      },
    },
    select: PRODUCT_CARD_SELECT,
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  if (sameCategoryProducts.length >= limit) {
    return sameCategoryProducts;
  }

  const existingIds = [productId, ...sameCategoryProducts.map((item) => item.id)];
  const fallbackProducts = await prisma.product.findMany({
    where: {
      isHidden: false,
      id: { notIn: existingIds },
    },
    select: PRODUCT_CARD_SELECT,
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    take: limit - sameCategoryProducts.length,
  });

  return [...sameCategoryProducts, ...fallbackProducts];
});

export const getProductsByCategory = cache(async (categorySlug: string) => {
  return prisma.product.findMany({
    where: {
      isHidden: false,
      category: {
        equals: decodeURIComponent(categorySlug),
        mode: "insensitive",
      },
    },
    select: PRODUCT_CARD_SELECT,
    orderBy: { createdAt: "desc" },
  });
});

export const getSiteSettings = cache(async () => {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: "main" },
    });
  }

  return settings;
});

export const getResources = cache(async () => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { order: "asc" },
    });

    if (resources.length > 0) {
      return normalizeResources(resources);
    }
  } catch (error) {
    console.warn("Resource table unavailable, falling back to site settings.", error);
  }

  const settings = await getSiteSettings();
  return normalizeResources(settings.resourceLinks);
});

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://lukari-account.vercel.app";
}
