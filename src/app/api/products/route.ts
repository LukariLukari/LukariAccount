import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CARD_SELECT } from "@/lib/storefront";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    
    const where: Prisma.ProductWhereInput = { isHidden: false };
    if (category && category !== "all") {
      where.category = {
        equals: category,
        mode: 'insensitive'
      };
    }

    const products = await prisma.product.findMany({
      where,
      select: PRODUCT_CARD_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
