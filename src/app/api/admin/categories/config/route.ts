import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadJsonToR2 } from "@/lib/r2-json";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { CATEGORY_CONFIG_TAG, getCategoryConfig } from "@/lib/storefront";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isScan = searchParams.get("scan") === "true";

    if (isScan) {
      const session = await getServerSession(authOptions);
      if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Scan DB for unique categories
      const products = await prisma.product.findMany({ select: { category: true } });
      const dbCategories = Array.from(new Set(products.map(p => p.category)));
      return NextResponse.json(dbCategories);
    }

    const categories = await getCategoryConfig();
    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch category config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await req.json();
    // Ensure it's an array
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }
    await uploadJsonToR2("categories_config.json", categories);
    revalidateTag(CATEGORY_CONFIG_TAG, "max");
    return NextResponse.json({ message: "Categories synced to R2" });
  } catch {
    return NextResponse.json({ error: "Failed to save to R2" }, { status: 500 });
  }
}
