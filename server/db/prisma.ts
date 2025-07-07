// @/server/db/prisma.ts

import { db } from "@/lib/prisma";
import { FullProduct } from "@/types/product";

export const getAllProducts = async () => {
  try {
    const products: FullProduct[] = await db.product.findMany({
      include: {
        category: true,
        reviews: true,
        variants: {
          include: {
            size: true,
            color: true,
            images: true,
            product: true,
          },
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
};

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: true,
      variants: {
        include: {
          size: true,
          color: true,
          images: true,
          product: true,
        },
      },
    },
  });
}

// Get products by category
export async function getProductsByCategory(categorySlug: string) {
  try {
    const products = await db.product.findMany({
      where: {
        category: {
          name: {
            equals: categorySlug,
            mode: 'insensitive'
          }
        }
      },
      include: {
        category: true,
        reviews: true,
        variants: {
          include: {
            size: true,
            color: true,
            images: true,
            product: true,
          },
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

// Sorting products
export type SortOption =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-desc"
  | "date-asc";

export async function getSortedProducts(sort: SortOption) {
  let orderBy: Array<Record<string, "asc" | "desc">> = [];

  switch (sort) {
    case "name-asc":
      orderBy = [{ name: "asc" }];
      break;
    case "name-desc":
      orderBy = [{ name: "desc" }];
      break;
    case "price-asc":
      orderBy = [{ price: "asc" }];
      break;
    case "price-desc":
      orderBy = [{ price: "desc" }];
      break;
    case "date-desc":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "date-asc":
      orderBy = [{ createdAt: "asc" }];
      break;
    case "featured":
      orderBy = [{ isLimitedEdition: "desc" }, { createdAt: "desc" }];
      break;
    default:
      orderBy = [{ createdAt: "desc" }];
      break;
  }

  const products = await db.product.findMany({
    orderBy,
    include: {
      category: true,
      variants: {
        include: {
          size: true,
          color: true,
          images: true,
          product: true,
        },
      },
      reviews: true,
    },
  });

  return products;
}

// Helper function to get category by slug
export async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: {
      name: {
        equals: slug,
        mode: 'insensitive'
      }
    }
  });
}