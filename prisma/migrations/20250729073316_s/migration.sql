/*
  Warnings:

  - You are about to drop the column `governorate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "governorate",
DROP COLUMN "shippingAddress";
