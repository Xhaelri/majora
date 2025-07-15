-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "Color" ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "nameAr" TEXT;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "altTextAr" TEXT;

-- AlterTable
ALTER TABLE "Size" ADD COLUMN     "nameAr" TEXT;
