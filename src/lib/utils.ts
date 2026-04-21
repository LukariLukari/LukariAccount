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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const targetSize = maxSizeMB * 1024 * 1024;
        let quality = 0.9;
        let scale = 1;

        // Bắt đầu với scale nhỏ hơn nếu file gốc quá lớn (>10MB)
        if (file.size > 10 * 1024 * 1024) {
          scale = 0.8;
        }

        const compress = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported"));

          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Blob conversion failed"));
            
            if (blob.size > targetSize) {
              if (quality > 0.5) {
                quality -= 0.1;
                compress();
              } else if (scale > 0.3) {
                scale -= 0.2;
                quality = 0.8; // reset lại chất lượng khi giảm kích thước ảnh
                compress();
              } else {
                reject(new Error(`Không thể nén ảnh xuống dưới ${maxSizeMB}MB. Vui lòng chọn ảnh khác.`));
              }
            } else {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: "image/webp",
              });
              resolve(webpFile);
            }
          }, "image/webp", quality);
        };
        
        compress();
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
