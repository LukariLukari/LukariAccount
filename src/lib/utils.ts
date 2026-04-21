import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US').format(price);
}

export function parseFormattedPrice(value: string): number {
  return Number(value.replace(/,/g, ""));
}

export async function compressImageToWebp(file: File, maxSizeMB: number = 5): Promise<File> {
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Blob conversion failed"));
          const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: "image/webp",
          });
          resolve(webpFile);
        }, "image/webp", 0.85); // 0.85 is the quality
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
