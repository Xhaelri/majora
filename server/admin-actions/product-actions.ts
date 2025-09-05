"use server";

import { db } from "@/lib/prisma"; // Adjust path as needed
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Types
export interface CreateProductData {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  slug: string;
  price: number;
  salePrice?: number;
  isLimitedEdition?: boolean;
  isAvailable?: boolean;
  categoryId?: string;
  variants?: CreateProductVariantData[];
}

export interface CreateProductVariantData {
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
}

export interface UpdateProductData {
  id: string;
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  slug?: string;
  price?: number;
  salePrice?: number;
  isLimitedEdition?: boolean;
  isAvailable?: boolean;
  categoryId?: string;
}

// Return types for better type safety
export interface ProductActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// CREATE
export async function createProduct(
  data: CreateProductData
): Promise<ProductActionResult> {
  try {
    const product = await db.product.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        slug: data.slug,
        price: data.price,
        salePrice: data.salePrice,
        isLimitedEdition: data.isLimitedEdition ?? false,
        isAvailable: data.isAvailable ?? true,
        categoryId: data.categoryId,
        variants: data.variants
          ? {
              create: data.variants.map((variant) => ({
                size: variant.size,
                color: variant.color,
                colorHex: variant.colorHex,
                stock: variant.stock,
                images: variant.images,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, data: product };
  } catch (error) {
    console.error("Create product error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Product slug already exists" };
      }
    }
    return { success: false, error: "Failed to create product" };
  }
}

// UPDATE
export async function updateProduct(
  id: string,
  data: UpdateProductData
): Promise<ProductActionResult> {
  try {
    const product = await db.product.update({
      where: { id },
      data,
      include: {
        category: true,
        variants: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${data.id}`);
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

    return { success: true, data: product };
  } catch (error) {
    console.error("Update product error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Product slug already exists" };
      }
      if (error.code === "P2025") {
        return { success: false, error: "Product not found" };
      }
    }

    return { success: false, error: "Failed to update product" };
  }
}

// UPDATE - Toggle product availability
export async function toggleProductAvailability(
  id: string
): Promise<ProductActionResult> {
  try {
    const product = await db.product.findUnique({
      where: { id },
      select: { isAvailable: true, slug: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        isAvailable: !product.isAvailable,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      data: updatedProduct,
      message: `Product ${
        updatedProduct.isAvailable ? "enabled" : "disabled"
      } successfully`,
    };
  } catch (error) {
    console.error("Toggle product availability error:", error);
    return { success: false, error: "Failed to update product availability" };
  }
}

// DELETE
export async function deleteProduct(id: string): Promise<ProductActionResult> {
  try {
    const product = await db.product.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Delete product (variants will be cascade deleted)
    await db.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Delete product error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { success: false, error: "Product not found" };
      }
    }

    return { success: false, error: "Failed to delete product" };
  }
}

// // BULK DELETE
// export async function deleteProductsBulk(ids: string[]): Promise<ProductActionResult<{ count: number }>> {
//   try {
//     const result = await db.product.deleteMany({
//       where: { id: { in: ids } },
//     });

//     revalidatePath("/admin/products");
//     revalidatePath("/products");

//     return {
//       success: true,
//       data: { count: result.count },
//       message: `Successfully deleted ${result.count} products`,
//     };
//   } catch (error) {
//     console.error("Bulk delete products error:", error);
//     return { success: false, error: "Failed to delete products" };
//   }
// }

// // BULK UPDATE - Toggle availability for multiple products
// export async function toggleProductsAvailabilityBulk(
//   ids: string[],
//   isAvailable: boolean
// ): Promise<ProductActionResult<{ count: number }>> {
//   try {
//     const result = await db.product.updateMany({
//       where: { id: { in: ids } },
//       data: { isAvailable },
//     });

//     revalidatePath("/admin/products");
//     revalidatePath("/products");

//     return {
//       success: true,
//       data: { count: result.count },
//       message: `Successfully ${isAvailable ? "enabled" : "disabled"} ${
//         result.count
//       } products`,
//     };
//   } catch (error) {
//     console.error("Bulk toggle products availability error:", error);
//     return { success: false, error: "Failed to update products availability" };
//   }
// }
