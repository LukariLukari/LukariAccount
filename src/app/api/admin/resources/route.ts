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

function normalizeMatchValue(value: string) {
  return value.trim().toLowerCase();
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
    const normalizedResources = reindexResources(normalizeResources(body));
    let persistedResources = normalizedResources;

    try {
      await prisma.$transaction(async (tx) => {
        const existingResources = await tx.resource.findMany({
          select: { id: true, title: true, driveUrl: true },
        });

        const byId = new Map(existingResources.map((resource) => [resource.id, resource]));
        const byDriveUrl = new Map(
          existingResources
            .filter((resource) => resource.driveUrl.trim().length > 0)
            .map((resource) => [normalizeMatchValue(resource.driveUrl), resource])
        );
        const byTitle = new Map(
          existingResources
            .filter((resource) => resource.title.trim().length > 0)
            .map((resource) => [normalizeMatchValue(resource.title), resource])
        );

        const resources = normalizedResources.map((resource) => {
          const exact = byId.get(resource.id);
          if (exact) return resource;

          const driveMatch =
            resource.driveUrl.trim().length > 0
              ? byDriveUrl.get(normalizeMatchValue(resource.driveUrl))
              : null;
          if (driveMatch) {
            return { ...resource, id: driveMatch.id };
          }

          const titleMatch =
            resource.title.trim().length > 0
              ? byTitle.get(normalizeMatchValue(resource.title))
              : null;
          if (titleMatch) {
            return { ...resource, id: titleMatch.id };
          }

          return resource;
        });
        persistedResources = resources;

        for (const resource of resources) {
          await tx.resource.upsert({
            where: { id: resource.id },
            update: {
              title: resource.title,
              description: resource.description,
              detailDescription: resource.detailDescription,
              images: resource.images,
              driveUrl: resource.driveUrl,
              isPaid: resource.isPaid,
              price: resource.price,
              order: resource.order,
              category: resource.category,
            },
            create: {
              id: resource.id,
              title: resource.title,
              description: resource.description,
              detailDescription: resource.detailDescription,
              images: resource.images,
              driveUrl: resource.driveUrl,
              isPaid: resource.isPaid,
              price: resource.price,
              order: resource.order,
              category: resource.category,
            },
          });
        }

        const nextIds = resources.map((resource) => resource.id);
        await tx.resource.deleteMany({
          where: { id: { notIn: nextIds } },
        });
      });
    } catch (resourceError) {
      console.warn("Resource table unavailable, persisting resources in site settings fallback.", resourceError);
      const resourceLinks = normalizedResources as unknown as Prisma.InputJsonValue;
      await prisma.siteSettings.upsert({
        where: { id: "main" },
        update: { resourceLinks },
        create: { id: "main", resourceLinks },
      });
    }

    revalidatePath("/resources");
    revalidatePath("/resources/free");
    revalidatePath("/resources/paid");
    revalidatePath("/admin/resources");

    return NextResponse.json(persistedResources);
  } catch (error) {
    console.error("Update resources error:", error);
    return NextResponse.json({ error: "Failed to update resources" }, { status: 500 });
  }
}
