import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getJsonFromR2 } from "@/lib/r2-json";

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

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://lukari-account.vercel.app";
}
