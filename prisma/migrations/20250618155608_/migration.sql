/*
  Warnings:

  - Made the column `altText` on table `ProductImage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProductImage" ALTER COLUMN "altText" SET NOT NULL;
