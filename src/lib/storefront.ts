import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getJsonFromR2 } from "@/lib/r2-json";
import { normalizeResources } from "@/lib/resources";

const DEFAULT_CATEGORIES = ["AI", "Office", "Design", "OS", "Video", "Combo iOS"];

export const getCategoryConfig = cache(async () => {
  const config = await getJsonFromR2("categories_config.json");

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
  return prisma.product.findUnique({
    where: { slug },
  });
});

export const getRelatedProducts = cache(async (productId: string, category: string, limit = 8) => {
  const sameCategoryProducts = await prisma.product.findMany({
    where: {
      id: { not: productId },
      category: {
        contains: category,
        mode: "insensitive",
      },
    },
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  if (sameCategoryProducts.length >= limit) {
    return sameCategoryProducts;
  }

  const existingIds = [productId, ...sameCategoryProducts.map((item) => item.id)];
  const fallbackProducts = await prisma.product.findMany({
    where: {
      id: { notIn: existingIds },
    },
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    take: limit - sameCategoryProducts.length,
  });

  return [...sameCategoryProducts, ...fallbackProducts];
});

export const getProductsByCategory = cache(async (categorySlug: string) => {
  return prisma.product.findMany({
    where: {
      category: {
        contains: decodeURIComponent(categorySlug),
        mode: "insensitive",
      },
    },
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
