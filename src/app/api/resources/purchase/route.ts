import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WalletUserNotFoundError } from "@/lib/wallet";
import { syncLegacyResourcePurchases } from "@/lib/resource-access";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const resourceId = typeof body?.resourceId === "string" ? body.resourceId : "";
  if (!resourceId) {
    return NextResponse.json({ error: "INVALID_RESOURCE" }, { status: 400 });
  }

  try {
    const existingPurchasedIds = await syncLegacyResourcePurchases(session.user.id);
    if (existingPurchasedIds.includes(resourceId)) {
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        select: { driveUrl: true },
      });
      const wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
        select: { balance: true },
      });
      return NextResponse.json({
        success: true,
        driveUrl: resource?.driveUrl || null,
        walletBalance: wallet?.balance || 0,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const resource = await tx.resource.findUnique({
        where: { id: resourceId },
        select: { id: true, title: true, driveUrl: true, isPaid: true, price: true },
      });
      if (!resource || !resource.driveUrl) {
        throw new Error("RESOURCE_NOT_FOUND");
      }

      if (!resource.isPaid || resource.price <= 0) {
        return { driveUrl: resource.driveUrl, walletBalance: null };
      }

      const userExists = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      });
      if (!userExists) {
        throw new WalletUserNotFoundError(session.user.id);
      }

      const existing = await tx.resourcePurchase.findUnique({
        where: { userId_resourceId: { userId: session.user.id, resourceId } },
      });
      const wallet = await tx.wallet.upsert({
        where: { userId: session.user.id },
        update: {},
        create: { userId: session.user.id, balance: 0 },
      });
      if (existing) {
        return { driveUrl: resource.driveUrl, walletBalance: wallet.balance };
      }
      if (wallet.balance < resource.price) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const balanceAfter = wallet.balance - resource.price;
      await tx.wallet.update({
        where: { userId: session.user.id },
        data: { balance: balanceAfter },
      });

      await tx.resourcePurchase.create({
        data: {
          userId: session.user.id,
          resourceId: resource.id,
          amount: resource.price,
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: session.user.id,
          type: "PURCHASE",
          amount: -resource.price,
          balanceBefore: wallet.balance,
          balanceAfter,
          referenceType: "Resource",
          referenceId: resource.id,
          note: `Mua tài nguyên: ${resource.title}`,
        },
      });

      return { driveUrl: resource.driveUrl, walletBalance: balanceAfter };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof WalletUserNotFoundError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ error: "INSUFFICIENT_BALANCE" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "RESOURCE_NOT_FOUND") {
      return NextResponse.json({ error: "RESOURCE_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ error: "PURCHASE_FAILED" }, { status: 500 });
  }
}
