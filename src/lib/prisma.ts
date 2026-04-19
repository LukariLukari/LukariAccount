import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  
  const url = process.env.DATABASE_URL;
  console.log("Prisma initializing with URL length:", url ? url.length : 0);

  const client = new PrismaClient({
    log: ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
};

export const prisma = getPrisma();
