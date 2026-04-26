import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function ensureProductVisibilityColumns() {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false'
  );
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isSoldOut" BOOLEAN NOT NULL DEFAULT false'
  );
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids, data } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isBestSeller !== undefined) updateData.isBestSeller = data.isBestSeller;
    if (data.isHidden !== undefined) updateData.isHidden = data.isHidden;
    if (data.isSoldOut !== undefined) updateData.isSoldOut = data.isSoldOut;

    const isVisibilityOnlyUpdate =
      Object.keys(updateData).length > 0 &&
      Object.keys(updateData).every((key) => key === "isHidden" || key === "isSoldOut");

    if (isVisibilityOnlyUpdate) {
      await ensureProductVisibilityColumns();
      let count = 0;
      if (data.isHidden !== undefined) {
        const result = await prisma.$executeRawUnsafe(
          'UPDATE "Product" SET "isHidden" = $1, "updatedAt" = NOW() WHERE "id" = ANY($2)',
          !!data.isHidden,
          ids
        );
        count = Number(result);
      }
      if (data.isSoldOut !== undefined) {
        const result = await prisma.$executeRawUnsafe(
          'UPDATE "Product" SET "isSoldOut" = $1, "updatedAt" = NOW() WHERE "id" = ANY($2)',
          !!data.isSoldOut,
          ids
        );
        count = Number(result);
      }

      return NextResponse.json({
        message: `Đã cập nhật ${count || ids.length} sản phẩm thành công!`,
        count: count || ids.length,
      });
    }

    // Bulk update using updateMany
    const result = await prisma.product.updateMany({
      where: {
        id: { in: ids }
      },
      data: updateData
    });

    return NextResponse.json({ 
      message: `Đã cập nhật ${result.count} sản phẩm thành công!`,
      count: result.count 
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật hàng loạt" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }

    const result = await prisma.product.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({ 
      message: `Đã xóa ${result.count} sản phẩm thành công!`,
      count: result.count 
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa hàng loạt" }, { status: 500 });
  }
}
