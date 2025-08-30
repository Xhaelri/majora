"use server";

import { db } from "@/lib/prisma"; // Adjust path as needed



// READ - Get all variants for a product
export async function getProductVariants(productId: string) {
  try {
    if (!productId) {
      return { success: false, error: "Product ID is required" };
    }

    const variants = await db.productVariant.findMany({
      where: { productId },
      orderBy: [
        { size: "asc" },
        { color: "asc" },
      ],
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return { success: true, data: variants };
  } catch (error) {
    console.error("Get product variants error:", error);
    return { success: false, error: "Failed to fetch product variants" };
  }
}

// READ - Get a specific variant by ID
export async function getProductVariantById(id: string) {
  try {
    if (!id) {
      return { success: false, error: "Variant ID is required" };
    }

    const variant = await db.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      return { success: false, error: "Product variant not found" };
    }

    return { success: true, data: variant };
  } catch (error) {
    console.error("Get product variant error:", error);
    return { success: false, error: "Failed to fetch product variant" };
  }
}

// READ - Get all variants (for admin overview)
export async function getAllProductVariants() {
  try {
    const variants = await db.productVariant.findMany({
      orderBy: [
        { createdAt: "desc" },
      ],
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return { success: true, data: variants };
  } catch (error) {
    console.error("Get all product variants error:", error);
    return { success: false, error: "Failed to fetch product variants" };
  }
}


// UTILITY - Get variants by size
export async function getVariantsBySize(size: string) {
  try {
    const variants = await db.productVariant.findMany({
      where: { size },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: variants };
  } catch (error) {
    console.error("Get variants by size error:", error);
    return { success: false, error: "Failed to fetch variants by size" };
  }
}

// UTILITY - Get variants by color
export async function getVariantsByColor(color: string) {
  try {
    const variants = await db.productVariant.findMany({
      where: { color },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: variants };
  } catch (error) {
    console.error("Get variants by color error:", error);
    return { success: false, error: "Failed to fetch variants by color" };
  }
}

