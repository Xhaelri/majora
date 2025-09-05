"use server";

import { db } from "@/lib/prisma";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ProductActionResult } from "./product-actions";

// Types
export interface CreateProductVariantData {
  productId: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
}

export interface UpdateProductVariantData {
  id: string;
  size?: string;
  color?: string;
  colorHex?: string;
  stock?: number;
  images?: string[];
}

// CREATE - Create a new product variant
export async function createProductVariant(data: CreateProductVariantData) {
  try {
    // Validate required fields
    if (
      !data.productId ||
      !data.size ||
      !data.color ||
      !data.colorHex ||
      !data.stock ||
      !data.images.length
    ) {
      return {
        success: false,
        error:
          "Product ID, size, color, color hex, stock, and at least one image are required",
      };
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Check if variant with same productId, size, and color already exists
    const existingVariant = await db.productVariant.findUnique({
      where: {
        productId_size_color: {
          productId: data.productId,
          size: data.size,
          color: data.color,
        },
      },
    });

    if (existingVariant) {
      return {
        success: false,
        error:
          "A variant with this size and color already exists for this product",
      };
    }

    const variant = await db.productVariant.create({
      data: {
        productId: data.productId,
        size: data.size,
        color: data.color,
        colorHex: data.colorHex,
        stock: data.stock,
        images: data.images,
      },
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

    revalidatePath(`/admin/products`);
    revalidatePath(`/admin/products/${data.productId}`);
    revalidatePath(`/products/${product.slug}`);

    return { success: true, data: variant };
  } catch (error) {
    console.error("Create product variant error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error:
            "A variant with this size and color already exists for this product",
        };
      }

      if (error.code === "P2003") {
        return { success: false, error: "Product not found" };
      }
    }

    return { success: false, error: "Failed to create product variant" };
  }
}

// UPDATE - Update a product variant
export async function updateProductVariant(data: UpdateProductVariantData) {
  try {
    if (!data.id) {
      return { success: false, error: "Variant ID is required" };
    }

    // Check if variant exists
    const existingVariant = await db.productVariant.findUnique({
      where: { id: data.id },
      include: {
        product: true,
      },
    });

    if (!existingVariant) {
      return { success: false, error: "Product variant not found" };
    }

    // If size or color is being updated, check for conflicts
    if (data.size !== undefined || data.color !== undefined) {
      const newSize = data.size ?? existingVariant.size;
      const newColor = data.color ?? existingVariant.color;

      // Only check for conflicts if the size or color is actually changing
      if (
        newSize !== existingVariant.size ||
        newColor !== existingVariant.color
      ) {
        const conflictingVariant = await db.productVariant.findFirst({
          where: {
            productId: existingVariant.productId,
            size: newSize,
            color: newColor,
            id: { not: data.id }, // Exclude current variant
          },
        });

        if (conflictingVariant) {
          return {
            success: false,
            error:
              "A variant with this size and color already exists for this product",
          };
        }
      }
    }

    // Validate images if provided
    if (data.images !== undefined && data.images.length === 0) {
      return { success: false, error: "At least one image is required" };
    }

    const variant = await db.productVariant.update({
      where: { id: data.id },
      data: {
        ...(data.size !== undefined && { size: data.size }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.colorHex !== undefined && { colorHex: data.colorHex }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.images !== undefined && { images: data.images }),
      },
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

    revalidatePath(`/admin/products`);
    revalidatePath(`/admin/products/${existingVariant.productId}`);
    revalidatePath(`/products/${existingVariant.product.slug}`);

    return { success: true, data: variant };
  } catch (error) {
    console.error("Update product variant error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error:
            "A variant with this size and color already exists for this product",
        };
      }

      if (error.code === "P2025") {
        return { success: false, error: "Product variant not found" };
      }
    }

    return { success: false, error: "Failed to update product variant" };
  }
}

// DELETE - Delete a product variant
export async function deleteProductVariant(
  id: string
): Promise<ProductActionResult> {
  try {
    if (!id) {
      return { success: false, error: "Variant ID is required" };
    }

    // Check if variant exists and get product info
    const variant = await db.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            _count: {
              select: {
                variants: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      return { success: false, error: "Product variant not found" };
    }

    // Check for existing orders/cart items containing this variant
    const existingOrders = await db.order.findMany({
      where: {
        items: {
          path: ["$[*]", "variantId"],
          array_contains: id,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: { id: true },
    });

    if (existingOrders.length > 0) {
      return {
        success: false,
        error: "Cannot delete variant as it exists in active orders",
      };
    }

    // Check for existing cart items containing this variant
    const existingCarts = await db.cart.findMany({
      where: {
        items: {
          path: ["$[*]", "variantId"],
          array_contains: id,
        },
      },
      select: { id: true },
    });

    if (existingCarts.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete variant as it exists in shopping carts. Please remove from carts first.",
      };
    }

    // Check if this is the last variant for the product
    const isLastVariant = variant.product._count.variants === 1;

    if (isLastVariant) {
      // Delete the entire product if this is the last variant
      await db.product.delete({
        where: { id: variant.product.id },
      });

      revalidatePath(`/admin/products`);
      revalidatePath(`/products`);

      return {
        success: true,
        message: "Product deleted successfully (last variant removed)",
        data: { productDeleted: true, productId: variant.product.id },
      };
    } else {
      // Delete only the variant
      await db.productVariant.delete({
        where: { id },
      });

      revalidatePath(`/admin/products`);
      revalidatePath(`/admin/products/${variant.product.id}`);
      revalidatePath(`/products/${variant.product.slug}`);

      return {
        success: true,
        message: "Product variant deleted successfully",
        data: { productDeleted: false, productId: variant.product.id },
      };
    }
  } catch (error) {
    console.error("Delete product variant error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { success: false, error: "Product variant not found" };
      }

      // Handle foreign key constraints if variant is referenced elsewhere
      if (error.code === "P2003") {
        return {
          success: false,
          error:
            "Cannot delete variant as it may be referenced in orders or carts",
        };
      }
    }

    return { success: false, error: "Failed to delete product variant" };
  }
}
