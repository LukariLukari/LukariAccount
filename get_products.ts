import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.product.findMany().then(p => {
  console.log(JSON.stringify(p, null, 2));
  prisma.$disconnect();
});
