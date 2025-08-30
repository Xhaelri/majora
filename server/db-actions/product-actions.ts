"use server";

import { db } from "@/lib/prisma"; // Adjust path as needed
import { Prisma } from "@prisma/client";


export interface ProductFilters {
  categoryId?: string;
  isAvailable?: boolean;
  isLimitedEdition?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "createdAt" | "name" | "price";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}


// READ - Get all products with filters and pagination
export async function getProducts(filters: ProductFilters = {}) {
  try {
    const {
      categoryId,
      isAvailable,
      isLimitedEdition,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters

    const skip = (page - 1) * limit

    // Build price filter safely
    const priceFilter: Prisma.IntFilter = {}
    if (minPrice !== undefined) priceFilter.gte = minPrice
    if (maxPrice !== undefined) priceFilter.lte = maxPrice

    const where: Prisma.ProductWhereInput = {
      ...(categoryId && { categoryId }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(isLimitedEdition !== undefined && { isLimitedEdition }),
      ...(Object.keys(priceFilter).length > 0 && { price: priceFilter }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { nameAr: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          variants: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
    }
  } catch (error) {
    console.error("Get products error:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}


// READ - Get product by ID
export async function getProductById(id: string) {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Get product error:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

// READ - Get product by slug
export async function getProductBySlug(slug: string) {
  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Get product by slug error:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

// READ - Get featured products (limited edition)
export async function getFeaturedProducts(limit = 8) {
  try {
    const products = await db.product.findMany({
      where: {
        isLimitedEdition: true,
        isAvailable: true,
      },
      include: {
        category: true,
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Get featured products error:", error);
    return { success: false, error: "Failed to fetch featured products" };
  }
}



export async function getProductsByCategoryName(categoryName: string) {
  try {
    const products = await db.product.findMany({
      where: {
        category: {
          name: categoryName,
        },
        isAvailable: true,
      },
      include: {
        category: true,
        variants: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return products;
  } catch (error) {
    console.error("Error fetching products by category name:", error);
    throw new Error("Failed to fetch products");
  }
}
