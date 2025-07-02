-- Step 1: Add the "variantId" column as optional (nullable)
ALTER TABLE "ProductImage" ADD COLUMN "variantId" TEXT;

-- Step 2: Update existing images to link them to the first variant of their product
UPDATE "ProductImage"
SET "variantId" = (
  SELECT v.id
  FROM "ProductVariant" v
  WHERE v."productId" = "ProductImage"."productId"
  ORDER BY v."createdAt" ASC
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1
  FROM "ProductVariant" v
  WHERE v."productId" = "ProductImage"."productId"
);

-- Step 3: For any images still without a variantId (because their product has no variants),
-- assign them the very first variant in the entire database as a fallback.
UPDATE "ProductImage"
SET "variantId" = (
  SELECT id FROM "ProductVariant" ORDER BY "createdAt" ASC LIMIT 1
)
WHERE "variantId" IS NULL;

-- Step 4: Now that all rows have a value, make the "variantId" column required
ALTER TABLE "ProductImage" ALTER COLUMN "variantId" SET NOT NULL;

-- Step 5: Add the foreign key constraint
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Finally, remove the now-redundant productId from ProductImage
ALTER TABLE "ProductImage" DROP COLUMN "productId";