import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, 
      slug, 
      description, 
      price, 
      originalPrice, 
      billingCycle, 
      image, 
      category, 
      isBestSeller,
      isFeatured,
      isHidden,
      isSoldOut,
      plans,
      warranty,
      details,
      features,
      instructions
    } = body;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        billingCycle,
        image,
        category,
        isBestSeller: !!isBestSeller,
        isFeatured: !!isFeatured,
        isHidden: !!isHidden,
        isSoldOut: !!isSoldOut,
        plans,
        warranty,
        details,
        features,
        instructions,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
