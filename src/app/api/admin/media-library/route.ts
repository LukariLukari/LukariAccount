import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

interface MediaItem {
  url: string;
  title: string;
  source: "product" | "resource" | "banner";
  subtitle?: string;
}

function addMediaItem(items: MediaItem[], seen: Set<string>, item: MediaItem) {
  const url = item.url.trim();
  if (!url || seen.has(url)) return;
  seen.add(url);
  items.push({ ...item, url });
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

export async function GET() {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const [products, resources, banners] = await Promise.all([
      prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          name: true,
          category: true,
          image: true,
        },
      }),
      prisma.resource.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          title: true,
          category: true,
          images: true,
        },
      }),
      prisma.banner.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          title: true,
          image: true,
        },
      }),
    ]);

    const items: MediaItem[] = [];
    const seen = new Set<string>();

    products.forEach((product) => {
      addMediaItem(items, seen, {
        url: product.image,
        title: product.name,
        subtitle: product.category,
        source: "product",
      });
    });

    resources.forEach((resource) => {
      getStringArray(resource.images).forEach((image, index) => {
        addMediaItem(items, seen, {
          url: image,
          title: resource.title || `Tài nguyên ${index + 1}`,
          subtitle: resource.category,
          source: "resource",
        });
      });
    });

    banners.forEach((banner) => {
      addMediaItem(items, seen, {
        url: banner.image,
        title: banner.title || "Banner",
        source: "banner",
      });
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Fetch media library error:", error);
    return NextResponse.json({ error: "Failed to fetch media library" }, { status: 500 });
  }
}
