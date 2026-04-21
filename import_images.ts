import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const imagesDir = path.join(process.cwd(), 'public/images/products');
  const files = fs.readdirSync(imagesDir);

  for (const file of files) {
    if (!file.match(/\.(png|jpe?g|webp)$/i)) continue;

    console.log(`Processing ${file}...`);
    
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    
    let price = 0;
    let name = basename;
    let category = "Other";
    
    const numMatch = basename.match(/^(\d+)$/);
    if (numMatch) {
      price = parseInt(numMatch[1], 10) * 1000;
      name = `Gói ${basename}k`;
    } else {
      if (basename.toLowerCase().includes("chatgpt") || basename.toLowerCase().includes("gemini") || basename.toLowerCase().includes("grok")) {
        category = "AI";
      } else if (basename.toLowerCase().includes("microsoft") || basename.toLowerCase().includes("office")) {
        category = "Office";
      } else if (basename.toLowerCase().includes("canva") || basename.toLowerCase().includes("capcut")) {
        category = "Design";
      } else if (basename.toLowerCase().includes("keywindow")) {
        category = "OS";
      }
      
      const priceMatch = basename.match(/\d+/);
      if (priceMatch) {
         price = parseInt(priceMatch[0], 10) * 1000;
      }
    }

    const filePath = path.join(imagesDir, file);
    const buffer = fs.readFileSync(filePath);
    
    // Check if product already exists
    const existing = await prisma.product.findFirst({ where: { name: name } });
    if (existing) {
      console.log(`Product ${name} already exists. Skipping.`);
      continue;
    }

    const blob = new Blob([buffer], { type: 'image/png' });
    const fd = new FormData();
    fd.append('file', blob, file);

    try {
      console.log(`Uploading ${file} to local endpoint...`);
      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) {
        console.log(`Upload failed for ${file}: ${res.statusText}`);
        const text = await res.text();
        console.log(text);
        continue;
      }
      const data = await res.json() as {url: string};
      const imageUrl = data.url;

      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, "").replace(/ +/g, "-") + "-" + Math.floor(Math.random()*1000);

      await prisma.product.create({
        data: {
          name: name,
          slug: slug,
          price: price,
          category: category,
          image: imageUrl,
          billingCycle: "tháng",
          isBestSeller: false,
          isFeatured: false,
          rating: 5,
          downloads: "0+",
          description: `Sản phẩm ${name}`,
          originalPrice: price > 0 ? price + 50000 : null
        }
      });
      console.log(`Successfully added product ${name} with price ${price} and image ${imageUrl}`);

    } catch(e) {
      console.log(`Error processing ${file}: `, e);
    }
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
