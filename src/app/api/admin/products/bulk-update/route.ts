import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { ids, data } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isBestSeller !== undefined) updateData.isBestSeller = data.isBestSeller;
    if (data.description !== undefined) updateData.description = data.description;

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
