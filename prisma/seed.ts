import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lukari.com" },
    update: {},
    create: {
      email: "admin@lukari.com",
      name: "Admin Lukari",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log({ admin });

  // 2. Import Products from data.ts (logic would go here)
  // For now, let's just create one sample product
  const product = await prisma.product.upsert({
    where: { slug: "chatgpt-plus" },
    update: {},
    create: {
      slug: "chatgpt-plus",
      name: "ChatGPT Plus",
      description: "Tài khoản ChatGPT Plus chính chủ, sử dụng model GPT-4 và các tính năng nâng cao mới nhất.",
      price: 200000,
      originalPrice: 530000,
      billingCycle: "tháng",
      rating: 4.9,
      downloads: "10k+",
      image: "/images/products/Chatgpt.png",
      category: "AI",
      isBestSeller: true,
      plans: [
        { label: "1 Tháng", price: 200000, cycle: "tháng" },
        { label: "6 Tháng", price: 1000000, cycle: "6 tháng" },
        { label: "1 Năm", price: 1800000, cycle: "năm" },
      ],
    },
  });

  console.log({ product });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
