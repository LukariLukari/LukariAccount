import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJsonFromR2, uploadJsonToR2 } from "@/lib/r2-json";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // Get config from R2
    const config = await getJsonFromR2("categories_config.json");
    
    let categories: string[] = [];
    
    if (Array.isArray(config)) {
      categories = config;
    } else if (config && typeof config === 'object') {
      // Transition from old object format
      categories = Object.keys(config);
    } else {
      // Default initial categories
      categories = ["AI", "Office", "Design", "OS", "Video", "Combo iOS"];
    }

    return NextResponse.json(categories);
  } catch (error) {
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
    return NextResponse.json({ message: "Categories synced to R2" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save to R2" }, { status: 500 });
  }
}
