import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const existingPrisma = globalThis.prisma;
const needsFreshClient =
  existingPrisma && !("wallet" in (existingPrisma as unknown as Record<string, unknown>));

if (needsFreshClient) {
  void (existingPrisma as ReturnType<typeof prismaClientSingleton>).$disconnect().catch(() => {});
  globalThis.prisma = undefined;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
