import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  
  const url = process.env.DATABASE_URL;
  const client = new PrismaClient({
    log: ["error"],
  });

  const availableModels = Object.keys(client).filter(k => !k.startsWith("_"));
  console.log(`[Prisma ${new Date().toISOString()}] Initialized. Models:`, availableModels.join(", "));

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
};

export const prisma = getPrisma();
