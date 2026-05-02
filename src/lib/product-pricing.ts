import type { Product } from "@/lib/data";

type FlashSaleProduct = Pick<
  Product,
  "price" | "flashSalePrice" | "flashSaleStartsAt" | "flashSaleEndsAt"
>;

function toTime(value: Date | string | null | undefined) {
  if (!value) return null;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function isFlashSaleActive(product: FlashSaleProduct, now = new Date()) {
  const salePrice = Number(product.flashSalePrice);
  if (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= product.price) {
    return false;
  }

  const nowTime = now.getTime();
  const startsAt = toTime(product.flashSaleStartsAt);
  const endsAt = toTime(product.flashSaleEndsAt);

  return (startsAt === null || startsAt <= nowTime) && (endsAt === null || endsAt > nowTime);
}

export function getEffectiveProductPrice(product: FlashSaleProduct, now = new Date()) {
  return isFlashSaleActive(product, now) ? Number(product.flashSalePrice) : product.price;
}

export function getDisplayOriginalPrice(product: Pick<Product, "price" | "originalPrice"> & FlashSaleProduct) {
  const effectivePrice = getEffectiveProductPrice(product);
  const originalCandidates = [product.originalPrice, product.price].filter(
    (price): price is number => typeof price === "number" && price > effectivePrice
  );

  return originalCandidates.length > 0 ? Math.max(...originalCandidates) : null;
}
