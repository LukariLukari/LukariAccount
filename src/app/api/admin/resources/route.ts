import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { normalizeResources, reindexResources } from "@/lib/resources";
import { Prisma } from "@prisma/client";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const resources = await prisma.resource.findMany({
        orderBy: { order: "asc" },
      });

      if (resources.length > 0) {
        return NextResponse.json(resources);
      }
    } catch (resourceError) {
      console.warn("Resource table unavailable, falling back to site settings.", resourceError);
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "main" },
      select: { resourceLinks: true },
    });

    return NextResponse.json(normalizeResources(settings?.resourceLinks));
  } catch (error) {
    console.error("Fetch resources error:", error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const resources = reindexResources(normalizeResources(body));

    try {
      await prisma.$transaction(async (tx) => {
        await tx.resource.deleteMany();

        if (resources.length > 0) {
          await tx.resource.createMany({
            data: resources.map((resource) => ({
              id: resource.id,
              title: resource.title,
              description: resource.description,
              detailDescription: resource.detailDescription,
              images: resource.images,
              driveUrl: resource.driveUrl,
              order: resource.order,
              category: resource.category,
            })),
          });
        }
      });
    } catch (resourceError) {
      console.warn("Resource table unavailable, persisting resources in site settings fallback.", resourceError);
      const resourceLinks = resources as unknown as Prisma.InputJsonValue;
      await prisma.siteSettings.upsert({
        where: { id: "main" },
        update: { resourceLinks },
        create: { id: "main", resourceLinks },
      });
    }

    revalidatePath("/resources");
    revalidatePath("/admin/resources");

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Update resources error:", error);
    return NextResponse.json({ error: "Failed to update resources" }, { status: 500 });
  }
}
