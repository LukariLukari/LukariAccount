import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { pickStringSettings } from "@/lib/api-validation";

async function ensurePaymentSettingsColumns() {
  await prisma.$executeRawUnsafe('ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "instagramLink" TEXT NOT NULL DEFAULT \'\'');
  await prisma.$executeRawUnsafe('ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "paymentGuideText" TEXT NOT NULL DEFAULT \'\'');
  await prisma.$executeRawUnsafe('ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "transferContentTemplate" TEXT NOT NULL DEFAULT \'\'');
  await prisma.$executeRawUnsafe('ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "orderMessageTemplate" TEXT NOT NULL DEFAULT \'\'');
  await prisma.$executeRawUnsafe('ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "paymentFooterText" TEXT NOT NULL DEFAULT \'\'');
}

// GET: Public - fetch site settings
export async function GET() {
  try {
    await ensurePaymentSettingsColumns();

    let settings = await prisma.siteSettings.findUnique({
      where: { id: "main" },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "main" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT: Admin only - update site settings
export async function PUT(req: Request) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    await ensurePaymentSettingsColumns();
    const updateData = pickStringSettings(body);

    const settings = await prisma.siteSettings.upsert({
      where: { id: "main" },
      update: updateData,
      create: { id: "main", ...updateData },
    });

    revalidatePath("/");
    revalidatePath("/resources");
    revalidatePath("/admin/resources");
    revalidatePath("/admin/settings");

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
