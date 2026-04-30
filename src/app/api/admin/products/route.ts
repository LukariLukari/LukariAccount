<<<<<<< Updated upstream
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { isRecord, readBoolean, readNumber, readRequiredString } from "@/lib/api-validation";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

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
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
    }

    const name = readRequiredString(body, "name");
    const slug = readRequiredString(body, "slug");
    const description = readRequiredString(body, "description");
    const image = readRequiredString(body, "image");
    const category = readRequiredString(body, "category");
    const price = readNumber(body, "price");

    if (!name || !slug || !description || !image || !category || price <= 0) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        originalPrice: body.originalPrice ? readNumber(body, "originalPrice") : null,
        billingCycle: readRequiredString(body, "billingCycle") || "tháng",
        image,
        category,
        isBestSeller: readBoolean(body, "isBestSeller"),
        isFeatured: readBoolean(body, "isFeatured"),
        isHidden: readBoolean(body, "isHidden"),
        isSoldOut: readBoolean(body, "isSoldOut"),
        plans: body.plans === undefined ? undefined : (body.plans as Prisma.InputJsonValue),
        warranty: readRequiredString(body, "warranty"),
        details: readRequiredString(body, "details"),
        features: body.features === undefined ? undefined : (body.features as Prisma.InputJsonValue),
        instructions: body.instructions === undefined ? undefined : (body.instructions as Prisma.InputJsonValue),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
=======
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
>>>>>>> Stashed changes
