<<<<<<< Updated upstream
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRecord } from "@/lib/api-validation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function makeOrderCode() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  return `LK${stamp}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function getPlanPrices(plans: unknown) {
  if (!Array.isArray(plans)) return [];
  return plans
    .map((plan) => {
      if (!plan || typeof plan !== "object") return null;
      const rawPlan = plan as Record<string, unknown>;
      const price = Number(rawPlan.price);
      return Number.isFinite(price) ? price : null;
    })
    .filter((price): price is number => price !== null);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    if (!isRecord(body)) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const items = Array.isArray(body.items)
      ? body.items
      : body.productId
        ? [{ productId: body.productId, quantity: body.quantity || 1 }]
        : [];

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    const normalizedItems = items
      .filter(isRecord)
      .map((item) => ({
        productId: typeof item.productId === "string" ? item.productId : "",
        quantity: Math.max(1, Number(item.quantity) || 1),
        unitPrice: Number(item.unitPrice),
        planLabel: typeof item.planLabel === "string" ? item.planLabel.trim() : "",
      }))
      .filter((item) => item.productId);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ success: false, error: "No valid checkout items" }, { status: 400 });
    }

    const couponCode =
      typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";
    const shouldCreateOrder = body.createOrder === true;
    const customerNote = typeof body.note === "string" ? body.note.trim() : "";

    const products = await prisma.product.findMany({
      where: {
        id: { in: normalizedItems.map((item) => item.productId) },
        isHidden: false,
        isSoldOut: false,
      },
    });

    const productById = new Map(products.map((product) => [product.id, product]));
    const checkedItems = normalizedItems.map((item) => {
      const product = productById.get(item.productId);
      const allowedPrices = [product?.price, ...getPlanPrices(product?.plans)].filter(
        (price): price is number => typeof price === "number"
      );
      const unitPrice =
        Number.isFinite(item.unitPrice) && allowedPrices.some((price) => price === item.unitPrice)
          ? item.unitPrice
          : product?.price;
      const productName = item.planLabel ? `${product?.name} (${item.planLabel})` : product?.name;
      return product
        ? {
            id: product.id,
            slug: product.slug,
            name: productName || product.name,
            price: unitPrice || product.price,
            quantity: item.quantity,
            total: (unitPrice || product.price) * item.quantity,
          }
        : null;
    });

    if (checkedItems.some((item) => !item)) {
      return NextResponse.json(
        { success: false, error: "Some products are unavailable" },
        { status: 400 }
      );
    }

    const validItems = checkedItems.filter(Boolean) as Array<{
      id: string;
      slug: string;
      name: string;
      price: number;
      quantity: number;
      total: number;
    }>;
    const subtotal = validItems.reduce((sum, item) => sum + item.total, 0);

    let appliedCoupon: {
      code: string;
      discountPercent: number;
    } | null = null;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ success: false, error: "Coupon is not active" }, { status: 400 });
      }

      if (coupon.expiresAt.getTime() < Date.now()) {
        return NextResponse.json({ success: false, error: "Coupon has expired" }, { status: 400 });
      }

      if (coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ success: false, error: "Coupon usage limit reached" }, { status: 400 });
      }

      appliedCoupon = {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      };
      discountAmount = Math.floor((subtotal * coupon.discountPercent) / 100);
    }

    const total = Math.max(0, subtotal - discountAmount);
    let order:
      | {
          id: string;
          orderCode: string;
          status: string;
        }
      | null = null;

    if (shouldCreateOrder) {
      order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            orderCode: makeOrderCode(),
            subtotal,
            discountAmount,
            total,
            couponCode: appliedCoupon?.code,
            customerNote,
            userId: session?.user?.id || null,
            items: {
              create: validItems.map((item) => ({
                productId: item.id,
                productName: item.name,
                productSlug: item.slug,
                unitPrice: item.price,
                quantity: item.quantity,
                total: item.total,
              })),
            },
          },
          select: {
            id: true,
            orderCode: true,
            status: true,
          },
        });

        if (appliedCoupon) {
          await tx.coupon.update({
            where: { code: appliedCoupon.code },
            data: { usageCount: { increment: 1 } },
          });
        }

        return createdOrder;
      });
    }

    return NextResponse.json({
      success: true,
      items: validItems,
      subtotal,
      discountAmount,
      total,
      coupon: appliedCoupon,
      order,
      message: "Checkout summary created successfully",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
=======
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId } = body;
    
    // Simulate Stripe checkout session creation
    return NextResponse.json({ 
      success: true, 
      url: `/checkout/success?session_id=mock_session_${Date.now()}&product_id=${productId}`,
      message: "Checkout session created successfully"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
>>>>>>> Stashed changes
