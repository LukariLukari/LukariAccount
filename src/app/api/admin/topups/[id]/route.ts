import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = await req.json();
    const action = typeof body?.action === "string" ? body.action : "";
    const adminNote = typeof body?.adminNote === "string" ? body.adminNote.trim() : "";

    if (action !== "confirm" && action !== "cancel") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const topUpRows = await tx.$queryRaw<
        Array<{
          id: string;
          userId: string;
          amount: number;
          code: string;
          status: string;
        }>
      >`
        SELECT "id", "userId", "amount", "code", "status"::text AS "status"
        FROM "TopUpRequest"
        WHERE "id" = ${id}
        LIMIT 1
      `;
      const topUpRequest = topUpRows[0];

      if (!topUpRequest) {
        throw new Error("NOT_FOUND");
      }

      if (topUpRequest.status !== "PENDING") {
        throw new Error("ALREADY_HANDLED");
      }

      if (action === "cancel") {
        const rows = await tx.$queryRaw<Array<Record<string, unknown>>>`
          UPDATE "TopUpRequest"
          SET
            "status" = 'CANCELLED'::"TopUpStatus",
            "cancelledAt" = NOW(),
            "adminNote" = ${adminNote},
            "updatedAt" = NOW()
          WHERE "id" = ${id}
          RETURNING
            "id",
            "userId",
            "amount",
            "code",
            "transferContent",
            "status"::text AS "status",
            "confirmedAt",
            "cancelledAt",
            "expiresAt",
            "adminNote",
            "createdAt",
            "updatedAt"
        `;
        return rows[0];
      }

      const walletRows = await tx.$queryRaw<Array<{ balance: number }>>`
        INSERT INTO "Wallet" ("id", "userId", "balance", "createdAt", "updatedAt")
        VALUES (${crypto.randomUUID()}, ${topUpRequest.userId}, 0, NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET "updatedAt" = "Wallet"."updatedAt"
        RETURNING "balance"
      `;
      const wallet = walletRows[0];
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + topUpRequest.amount;

      await tx.$executeRaw`
        UPDATE "Wallet"
        SET "balance" = ${balanceAfter}, "updatedAt" = NOW()
        WHERE "userId" = ${topUpRequest.userId}
      `;

      const paidRows = await tx.$queryRaw<Array<Record<string, unknown>>>`
        UPDATE "TopUpRequest"
        SET
          "status" = 'PAID'::"TopUpStatus",
          "confirmedAt" = NOW(),
          "adminNote" = ${adminNote},
          "updatedAt" = NOW()
        WHERE "id" = ${id}
        RETURNING
          "id",
          "userId",
          "amount",
          "code",
          "transferContent",
          "status"::text AS "status",
          "confirmedAt",
          "cancelledAt",
          "expiresAt",
          "adminNote",
          "createdAt",
          "updatedAt"
      `;
      const paidTopUpRequest = paidRows[0];

      await tx.$executeRaw`
        INSERT INTO "WalletTransaction" (
          "id",
          "userId",
          "type",
          "amount",
          "balanceBefore",
          "balanceAfter",
          "referenceType",
          "referenceId",
          "note",
          "createdAt"
        )
        VALUES (
          ${crypto.randomUUID()},
          ${topUpRequest.userId},
          'TOP_UP'::"WalletTransactionType",
          ${topUpRequest.amount},
          ${balanceBefore},
          ${balanceAfter},
          'TopUpRequest',
          ${topUpRequest.id},
          ${adminNote || `Nạp tiền ${topUpRequest.code}`},
          NOW()
        )
      `;

      return paidTopUpRequest;
    });

    return NextResponse.json({ topUpRequest: result });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Top up request not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "ALREADY_HANDLED") {
      return NextResponse.json({ error: "Yêu cầu nạp đã được xử lý" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update top up request" }, { status: 500 });
  }
}
