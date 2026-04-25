import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_SECTION_ORDER = ["warranty", "features", "instructions"];

function normalizeFeatures(features: unknown) {
  if (Array.isArray(features)) {
    return {
      items: features.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean),
      sectionOrder: DEFAULT_SECTION_ORDER,
    };
  }

  if (features && typeof features === "object") {
    return features;
  }

  return {
    items: [],
    sectionOrder: DEFAULT_SECTION_ORDER,
  };
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}

function normalizePlans(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((plan) => {
      if (!plan || typeof plan !== "object") return null;
      const rawPlan = plan as Record<string, unknown>;
      return {
        label: String(rawPlan.label || "Gói").trim(),
        price: Number(rawPlan.price) || 0,
        cycle: String(rawPlan.cycle || "tháng").trim(),
        type: typeof rawPlan.type === "string" ? rawPlan.type.trim() : undefined,
      };
    })
    .filter(Boolean);
}

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
      const productData = {
        name: String(p.name || "").trim(),
        description: String(p.description || "").trim(),
        price: parseFloat(p.price) || 0,
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
        billingCycle: String(p.billingCycle || "tháng").trim(),
        image: String(p.image || "").trim(),
        category: String(p.category || "AI").trim(),
        details: String(p.details || "").trim(),
        features: normalizeFeatures(p.features),
        instructions: normalizeStringArray(p.instructions),
        warranty: String(p.warranty || "").trim(),
        plans: normalizePlans(p.plans),
      };

      const result = await prisma.product.upsert({
        where: { slug: String(p.slug || "").trim() },
        update: productData,
        create: {
          ...productData,
          slug: String(p.slug || "").trim(),
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
