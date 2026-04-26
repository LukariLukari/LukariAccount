import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    const session = await getServerSession(authOptions);
    
    // Check if user is admin - using 'as any' to bypass strict augmentation issues in route handlers
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await ensurePaymentSettingsColumns();
    
    // Remove fields that should not be updated manually
    const { id, updatedAt, ...updateData } = body;

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
