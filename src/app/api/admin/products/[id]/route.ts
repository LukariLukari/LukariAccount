<<<<<<< Updated upstream
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { isRecord, readBoolean, readNumber, readRequiredString } from "@/lib/api-validation";

async function ensureProductVisibilityColumns() {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false'
  );
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isSoldOut" BOOLEAN NOT NULL DEFAULT false'
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
    }
    
    // Build update data object dynamically to support partial updates
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = readRequiredString(body, "name");
    if (body.slug !== undefined) updateData.slug = readRequiredString(body, "slug");
    if (body.description !== undefined) updateData.description = readRequiredString(body, "description");
    if (body.price !== undefined) updateData.price = readNumber(body, "price");
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? readNumber(body, "originalPrice") : null;
    if (body.billingCycle !== undefined) updateData.billingCycle = readRequiredString(body, "billingCycle");
    if (body.image !== undefined) updateData.image = readRequiredString(body, "image");
    if (body.category !== undefined) updateData.category = readRequiredString(body, "category");
    if (body.isBestSeller !== undefined) updateData.isBestSeller = readBoolean(body, "isBestSeller");
    if (body.isFeatured !== undefined) updateData.isFeatured = readBoolean(body, "isFeatured");
    if (body.isHidden !== undefined) updateData.isHidden = readBoolean(body, "isHidden");
    if (body.isSoldOut !== undefined) updateData.isSoldOut = readBoolean(body, "isSoldOut");
    if (body.plans !== undefined) updateData.plans = body.plans;
    if (body.warranty !== undefined) updateData.warranty = body.warranty;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.instructions !== undefined) updateData.instructions = body.instructions;

    const isVisibilityOnlyUpdate =
      Object.keys(updateData).length > 0 &&
      Object.keys(updateData).every((key) => key === "isHidden" || key === "isSoldOut");

    if (isVisibilityOnlyUpdate) {
      await ensureProductVisibilityColumns();
      if (body.isHidden !== undefined) {
        await prisma.$executeRawUnsafe(
          'UPDATE "Product" SET "isHidden" = $1, "updatedAt" = NOW() WHERE "id" = $2',
          !!body.isHidden,
          id
        );
      }
      if (body.isSoldOut !== undefined) {
        await prisma.$executeRawUnsafe(
          'UPDATE "Product" SET "isSoldOut" = $1, "updatedAt" = NOW() WHERE "id" = $2',
          !!body.isSoldOut,
          id
        );
      }

      return NextResponse.json({ id, ...updateData });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `Đã xóa sản phẩm "${existingProduct.name}" thành công.`,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
=======
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    // Build update data object dynamically to support partial updates
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null;
    if (body.billingCycle !== undefined) updateData.billingCycle = body.billingCycle;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.isBestSeller !== undefined) updateData.isBestSeller = body.isBestSeller;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.plans !== undefined) updateData.plans = body.plans;
    if (body.warranty !== undefined) updateData.warranty = body.warranty;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.instructions !== undefined) updateData.instructions = body.instructions;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
>>>>>>> Stashed changes
