import { prisma } from "@/lib/prisma";

export const MIN_TOP_UP_AMOUNT = 10000;
export const MAX_TOP_UP_AMOUNT = 50000000;

export function normalizeTopUpAmount(value: unknown) {
  const amount = Math.floor(Number(value));
  if (!Number.isFinite(amount)) return 0;
  return amount;
}

export function makeTopUpCode() {
  return `NAP${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export function getTopUpTransferContent(code: string) {
  return `NAP ${code}`;
}

export interface WalletRecord {
  id: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransactionRecord {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: Date;
}

export interface TopUpRequestRecord {
  id: string;
  userId: string;
  amount: number;
  code: string;
  transferContent: string;
  status: string;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  expiresAt: Date | null;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class WalletUserNotFoundError extends Error {
  constructor(userId: string) {
    super(`WALLET_USER_NOT_FOUND:${userId}`);
    this.name = "WalletUserNotFoundError";
  }
}

export async function ensureWallet(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new WalletUserNotFoundError(userId);
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `wallet_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const rows = await prisma.$queryRaw<WalletRecord[]>`
    INSERT INTO "Wallet" ("id", "userId", "balance", "createdAt", "updatedAt")
    VALUES (${id}, ${userId}, 0, NOW(), NOW())
    ON CONFLICT ("userId") DO UPDATE SET "updatedAt" = "Wallet"."updatedAt"
    RETURNING "id", "userId", "balance", "createdAt", "updatedAt"
  `;

  return rows[0];
}

export async function getWalletTransactions(userId: string, take = 20) {
  return prisma.$queryRaw<WalletTransactionRecord[]>`
    SELECT
      "id",
      "userId",
      "type"::text AS "type",
      "amount",
      "balanceBefore",
      "balanceAfter",
      "referenceType",
      "referenceId",
      "note",
      "createdAt"
    FROM "WalletTransaction"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT ${take}
  `;
}

export async function getTopUpRequests(userId: string, take = 10) {
  return prisma.$queryRaw<TopUpRequestRecord[]>`
    SELECT
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
    FROM "TopUpRequest"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT ${take}
  `;
}
