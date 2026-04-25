import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getJsonFromR2, uploadJsonToR2 } from "@/lib/r2-json";
import { normalizeProductContentTemplates } from "@/lib/product-templates";

const TEMPLATE_CONFIG_KEY = "product_content_templates.json";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getJsonFromR2(TEMPLATE_CONFIG_KEY);
    return NextResponse.json(normalizeProductContentTemplates(config));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product templates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = normalizeProductContentTemplates(await req.json());
    await uploadJsonToR2(TEMPLATE_CONFIG_KEY, templates);

    return NextResponse.json({ message: "Product templates saved", templates });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save product templates" }, { status: 500 });
  }
}
