import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJsonFromR2, uploadJsonToR2 } from "@/lib/r2-json";

export async function GET() {
  try {
    // 1. Get unique categories from Products table
    const products = await prisma.product.findMany({
      select: { category: true }
    });
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

    // 2. Get existing config from R2
    const config = await getJsonFromR2("categories_config.json") || {};

    // 3. Merge: Ensure all categories from DB are in config
    const mergedConfig = { ...config };
    uniqueCategories.forEach(cat => {
      if (!mergedConfig[cat]) {
        mergedConfig[cat] = {
          image: "",
          icon: "",
          description: ""
        };
      }
    });

    return NextResponse.json(mergedConfig);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch category config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await uploadJsonToR2("categories_config.json", data);
    return NextResponse.json({ message: "Config saved to R2" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
