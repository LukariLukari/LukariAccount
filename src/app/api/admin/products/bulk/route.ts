import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await req.json();
    
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const results = [];
    for (const p of products) {
      const result = await prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          description: p.description,
          price: parseFloat(p.price),
          originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
          billingCycle: p.billingCycle,
          image: p.image,
          category: p.category,
        },
        create: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: parseFloat(p.price),
          originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
          billingCycle: p.billingCycle,
          image: p.image,
          category: p.category,
        },
      });
      results.push(result);
    }

    return NextResponse.json({ message: `Successfully imported ${results.length} products`, count: results.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 });
  }
}
