ALTER TABLE "Resource"
ADD COLUMN IF NOT EXISTS "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "ResourcePurchase" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResourcePurchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ResourcePurchase_userId_resourceId_key"
ON "ResourcePurchase"("userId", "resourceId");

CREATE INDEX IF NOT EXISTS "ResourcePurchase_userId_createdAt_idx"
ON "ResourcePurchase"("userId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ResourcePurchase_userId_fkey'
  ) THEN
    ALTER TABLE "ResourcePurchase"
    ADD CONSTRAINT "ResourcePurchase_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ResourcePurchase_resourceId_fkey'
  ) THEN
    ALTER TABLE "ResourcePurchase"
    ADD CONSTRAINT "ResourcePurchase_resourceId_fkey"
    FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
