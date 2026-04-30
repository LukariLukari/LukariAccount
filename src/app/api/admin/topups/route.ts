import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const TOP_UP_STATUSES = ["PENDING", "PAID", "CANCELLED", "EXPIRED"] as const;

export async function GET(req: Request) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const statusFilter = TOP_UP_STATUSES.find((item) => item === status);

    const rows = statusFilter
      ? await prisma.$queryRaw<Array<Record<string, unknown>>>`
          SELECT
            t."id",
            t."amount",
            t."code",
            t."transferContent",
            t."status"::text AS "status",
            t."adminNote",
            t."createdAt",
            t."confirmedAt",
            u."name" AS "userName",
            u."email" AS "userEmail",
            COALESCE(w."balance", 0) AS "walletBalance"
          FROM "TopUpRequest" t
          JOIN "User" u ON u."id" = t."userId"
          LEFT JOIN "Wallet" w ON w."userId" = t."userId"
          WHERE t."status" = ${statusFilter}::"TopUpStatus"
          ORDER BY t."createdAt" DESC
          LIMIT 100
        `
      : await prisma.$queryRaw<Array<Record<string, unknown>>>`
          SELECT
            t."id",
            t."amount",
            t."code",
            t."transferContent",
            t."status"::text AS "status",
            t."adminNote",
            t."createdAt",
            t."confirmedAt",
            u."name" AS "userName",
            u."email" AS "userEmail",
            COALESCE(w."balance", 0) AS "walletBalance"
          FROM "TopUpRequest" t
          JOIN "User" u ON u."id" = t."userId"
          LEFT JOIN "Wallet" w ON w."userId" = t."userId"
          ORDER BY t."createdAt" DESC
          LIMIT 100
        `;

    const topUpRequests = rows.map((item) => ({
      id: item.id,
      amount: item.amount,
      code: item.code,
      transferContent: item.transferContent,
      status: item.status,
      adminNote: item.adminNote,
      createdAt: item.createdAt,
      confirmedAt: item.confirmedAt,
      user: {
        name: item.userName,
        email: item.userEmail,
        wallet: { balance: item.walletBalance },
      },
    }));

    return NextResponse.json({ topUpRequests });
  } catch {
    return NextResponse.json({ error: "Failed to fetch top up requests" }, { status: 500 });
  }
}
