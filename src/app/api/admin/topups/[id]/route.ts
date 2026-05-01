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
      const topUpRequest = await tx.topUpRequest.findUnique({
        where: { id },
      });

      if (!topUpRequest) {
        throw new Error("NOT_FOUND");
      }

      if (topUpRequest.status !== "PENDING") {
        throw new Error("ALREADY_HANDLED");
      }

      if (action === "cancel") {
        return await tx.topUpRequest.update({
          where: { id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            adminNote,
          },
        });
      }

      // Xử lý xác nhận nạp tiền
      const userId = topUpRequest.userId;
      const amount = topUpRequest.amount;

      // Đảm bảo ví tồn tại (sử dụng upsert để nguyên tử)
      const wallet = await tx.wallet.upsert({
        where: { userId },
        create: {
          userId,
          balance: amount,
        },
        update: {
          balance: { increment: amount },
        },
      });

      const balanceAfter = wallet.balance;
      const balanceBefore = balanceAfter - amount;

      // Cập nhật trạng thái yêu cầu nạp
      const updatedTopUpRequest = await tx.topUpRequest.update({
        where: { id },
        data: {
          status: "PAID",
          confirmedAt: new Date(),
          adminNote,
        },
      });

      // Ghi nhận giao dịch ví
      await tx.walletTransaction.create({
        data: {
          userId,
          type: "TOP_UP",
          amount,
          balanceBefore,
          balanceAfter,
          referenceType: "TopUpRequest",
          referenceId: id,
          note: adminNote || `Nạp tiền ${topUpRequest.code}`,
        },
      });

      return updatedTopUpRequest;
    });

    return NextResponse.json({ topUpRequest: result });
  } catch (error) {
    console.error("Admin topup update error:", error);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Top up request not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "ALREADY_HANDLED") {
      return NextResponse.json({ error: "Yêu cầu nạp đã được xử lý" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update top up request" },
      { status: 500 }
    );
  }
}
