import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [productCount, userCount, couponCount] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.coupon.count(),
    ]);

    return NextResponse.json({
      productCount,
      userCount,
      couponCount,
      // Sample data for charts
      revenue: "152.4M₫",
      traffic: "24.5k"
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
