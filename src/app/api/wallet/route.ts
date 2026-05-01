import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_TOP_UP_AMOUNT,
  MIN_TOP_UP_AMOUNT,
  ensureWallet,
  getTopUpRequests,
  getTopUpTransferContent,
  getWalletTransactions,
  makeTopUpCode,
  normalizeTopUpAmount,
  WalletUserNotFoundError,
} from "@/lib/wallet";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await ensureWallet(session.user.id);
    const [transactions, topUpRequests] = await Promise.all([
      getWalletTransactions(session.user.id, 20),
      getTopUpRequests(session.user.id, 10),
    ]);

    return NextResponse.json({ wallet, transactions, topUpRequests });
  } catch (error) {
    if (error instanceof WalletUserNotFoundError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = normalizeTopUpAmount(body?.amount);

    if (amount < MIN_TOP_UP_AMOUNT || amount > MAX_TOP_UP_AMOUNT) {
      return NextResponse.json(
        {
          error: `Số tiền nạp phải từ ${MIN_TOP_UP_AMOUNT} đến ${MAX_TOP_UP_AMOUNT}`,
        },
        { status: 400 }
      );
    }

    await ensureWallet(session.user.id);
    const code = makeTopUpCode();
    const transferContent = getTopUpTransferContent(code);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const topUpRequest = await prisma.topUpRequest.create({
      data: {
        userId: session.user.id,
        amount,
        code,
        transferContent,
        status: "PENDING",
        expiresAt,
      },
    });

    return NextResponse.json({ topUpRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof WalletUserNotFoundError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create top up request" }, { status: 500 });
  }
}
