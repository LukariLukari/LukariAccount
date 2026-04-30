CREATE INDEX IF NOT EXISTS "Product_isHidden_createdAt_idx" ON "Product"("isHidden", "createdAt");
CREATE INDEX IF NOT EXISTS "Product_isHidden_category_idx" ON "Product"("isHidden", "category");
CREATE INDEX IF NOT EXISTS "Product_isHidden_isBestSeller_createdAt_idx" ON "Product"("isHidden", "isBestSeller", "createdAt");
