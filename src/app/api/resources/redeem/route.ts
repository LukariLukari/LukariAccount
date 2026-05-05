import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Vui lòng nhập mã" }, { status: 400 });
    }

    const resourceCode = await prisma.resourceCode.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { resource: true },
    });

    if (!resourceCode) {
      return NextResponse.json({ error: "Mã không hợp lệ" }, { status: 404 });
    }

    if (resourceCode.expiresAt && resourceCode.expiresAt < new Date()) {
      return NextResponse.json({ error: "Mã đã hết hạn" }, { status: 400 });
    }

    if (resourceCode.usageCount >= resourceCode.maxUses) {
      return NextResponse.json({ error: "Mã đã hết lượt sử dụng" }, { status: 400 });
    }

    // Check if user already has access
    const existingPurchase = await prisma.resourcePurchase.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId: resourceCode.resourceId,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json({ error: "Bạn đã có quyền truy cập tài nguyên này" }, { status: 400 });
    }

    // Grant access
    await prisma.$transaction([
      prisma.resourcePurchase.create({
        data: {
          userId: session.user.id,
          resourceId: resourceCode.resourceId,
          amount: 0, // Code unlock is free
        },
      }),
      prisma.resourceCode.update({
        where: { id: resourceCode.id },
        data: {
          usageCount: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json({ 
        success: true, 
        message: "Mở khóa tài nguyên thành công!",
        driveUrl: resourceCode.resource.driveUrl 
    });
  } catch (error) {
    console.error("Redeem code error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra khi kích hoạt mã" }, { status: 500 });
  }
}
