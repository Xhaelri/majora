import { PrismaClient } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();

// Required for __dirname to work in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // ---- Load JSON data ----
  const [
    sizesData,
    colorsData,
    productsData,
    variantsData,
    imagesData,
    categoriesData,
  ] = await Promise.all([
    fs.readFile(path.join(__dirname, "Size.json"), "utf-8"),
    fs.readFile(path.join(__dirname, "Color.json"), "utf-8"),
    fs.readFile(path.join(__dirname, "Product.json"), "utf-8"),
    fs.readFile(path.join(__dirname, "ProductVariant.json"), "utf-8"),
    fs.readFile(path.join(__dirname, "ProductImage.json"), "utf-8"),
    fs.readFile(path.join(__dirname, "Category.json"), "utf-8"),
  ]);

  // Parse JSON data
  const parsedSizes = JSON.parse(sizesData);
  const parsedColors = JSON.parse(colorsData);
  const parsedProducts = JSON.parse(productsData);
  const parsedVariants = JSON.parse(variantsData);
  const parsedImages = JSON.parse(imagesData);
  const parsedCategories = JSON.parse(categoriesData);

  // Seed Categories
  for (const category of parsedCategories) {
    await prisma.category.create({
      data: {
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      },
    });
  }

  // Seed Sizes
  for (const size of parsedSizes) {
    await prisma.size.create({
      data: size,
    });
  }

  // Seed Colors
  for (const color of parsedColors) {
    await prisma.color.create({
      data: color,
    });
  }

  // Seed Products
  for (const product of parsedProducts) {
    await prisma.product.create({
      data: {
        ...product,
        price: parseFloat(product.price),
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      },
    });
  }

  // Seed Product Variants
  for (const variant of parsedVariants) {
    await prisma.productVariant.create({
      data: {
        ...variant,
        stock: parseInt(variant.stock),
        createdAt: new Date(variant.createdAt),
        updatedAt: new Date(variant.updatedAt),
      },
    });
  }

  // Seed Product Images
  for (const image of parsedImages) {
    await prisma.productImage.create({
      data: image,
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());