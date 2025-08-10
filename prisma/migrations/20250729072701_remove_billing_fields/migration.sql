/*
  Warnings:

  - You are about to drop the column `billingApartment` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingBuilding` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingCity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingCountry` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingFirstName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingFloor` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingLastName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingPhone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingPostalCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingState` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingStreet` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "billingApartment",
DROP COLUMN "billingBuilding",
DROP COLUMN "billingCity",
DROP COLUMN "billingCountry",
DROP COLUMN "billingEmail",
DROP COLUMN "billingFirstName",
DROP COLUMN "billingFloor",
DROP COLUMN "billingLastName",
DROP COLUMN "billingPhone",
DROP COLUMN "billingPostalCode",
DROP COLUMN "billingState",
DROP COLUMN "billingStreet";
