import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureWallet, WalletUserNotFoundError } from "@/lib/wallet";
import { syncLegacyResourcePurchases } from "@/lib/resource-access";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false, walletBalance: 0, purchasedResourceIds: [] });
  }

  try {
    const [wallet, purchasedResourceIds] = await Promise.all([
      ensureWallet(session.user.id),
      syncLegacyResourcePurchases(session.user.id),
    ]);

    return NextResponse.json({
      authenticated: true,
      walletBalance: wallet.balance,
      purchasedResourceIds,
    });
  } catch (error) {
    if (error instanceof WalletUserNotFoundError) {
      return NextResponse.json({ authenticated: false, walletBalance: 0, purchasedResourceIds: [] });
    }
    return NextResponse.json({ authenticated: false, walletBalance: 0, purchasedResourceIds: [] });
  }
}
