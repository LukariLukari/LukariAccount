import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const [
      productCount,
      userCount,
      couponCount,
      orderCount,
      pendingOrderCount,
      revenue,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.coupon.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderCode: true,
          status: true,
          total: true,
          couponCode: true,
          createdAt: true,
          items: {
            take: 3,
            select: {
              productName: true,
              quantity: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      productCount,
      userCount,
      couponCount,
      orderCount,
      pendingOrderCount,
      revenue: revenue._sum.total || 0,
      recentOrders,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
