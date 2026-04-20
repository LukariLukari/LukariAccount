import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const productsToSeed = [
  {
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
  {
    slug: "chatgpt-go",
    name: "ChatGPT GO",
    description: "Gói ChatGPT GO tiết kiệm, sử dụng 12 tháng với mức giá siêu ưu đãi.",
    price: 450000,
    originalPrice: 2550000,
    billingCycle: "12 tháng",
    rating: 4.8,
    downloads: "5k+",
    image: "/images/products/Chatgpt.png",
    category: "AI",
  },
  {
    slug: "gemini-pro",
    name: "Gemini AI Pro",
    description: "Google Gemini Pro mang đến sức mạnh AI tuyệt đỉnh được tích hợp sâu vào hệ sinh thái Google.",
    price: 249000,
    originalPrice: 5868000,
    billingCycle: "năm",
    rating: 4.8,
    downloads: "8k+",
    image: "/images/products/gemini.jpg",
    category: "AI",
  },
  {
    slug: "office-365-personal",
    name: "Office 365 Cá nhân",
    description: "Bản quyền Office 365 chính hãng dành cho 1 người dùng, đi kèm 1TB OneDrive.",
    price: 249000,
    originalPrice: 2500000,
    billingCycle: "năm",
    rating: 5.0,
    downloads: "20k+",
    image: "/images/products/microsoft.png",
    category: "Office",
  },
  {
    slug: "win-11-pro",
    name: "KEY WIN 11 PRO",
    description: "Key cấp phép Windows 11 Pro trọn đời chính hãng, update tự do.",
    price: 199000,
    billingCycle: "vĩnh viễn",
    rating: 4.9,
    downloads: "50k+",
    image: "/images/products/keywindow.png",
    category: "OS",
  },
  {
    slug: "canva-pro",
    name: "Canva Pro",
    description: "Thiết kế mọi thứ với Canva Pro, mở khóa toàn bộ template, element và font chữ premium.",
    price: 179000,
    originalPrice: 1800000,
    billingCycle: "năm",
    rating: 5.0,
    downloads: "100k+",
    image: "/images/products/canva.png",
    category: "Design",
  },
  {
    slug: "capcut-pro",
    name: "Capcut Pro",
    description: "Phần mềm chỉnh sửa video top 1, mở khóa toàn bộ hiệu ứng chuyển cảnh, bộ lọc.",
    price: 69000,
    originalPrice: 1800000,
    billingCycle: "năm",
    rating: 4.8,
    downloads: "30k+",
    image: "/images/products/capcut.jpg",
    category: "Video",
  },
  {
    slug: "combo-ios-4-app",
    name: "Combo 4 App Vĩnh Viễn",
    description: "Gói siêu cấp: Procreate + Goodnotes 6 + Procreate Dreams + CollaNote. Đầy đủ mọi công cụ sáng tạo.",
    price: 299000,
    billingCycle: "vĩnh viễn",
    rating: 5.0,
    downloads: "3k+",
    image: "/images/products/299.png",
    category: "Combo iOS",
  }
];

async function main() {
  // 1. Admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@lukari.com" },
    update: { password: hashedPassword, role: "ADMIN" },
    create: {
      email: "admin@lukari.com",
      name: "Admin Lukari",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2. Products
  for (const p of productsToSeed) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log("Seeding complete!");
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
