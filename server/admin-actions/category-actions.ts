"use server";

import { db } from "@/lib/prisma"; // Adjust path as needed
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Types
export interface CreateCategoryData {
  name: string;
  nameAr: string;
}

export interface UpdateCategoryData {
  id: string;
  name?: string;
  nameAr?: string;
}

// CREATE
export async function createCategory(data: CreateCategoryData) {
  try {
    const category = await db.category.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Create category error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Category name already exists" };
      }
    }

    return { success: false, error: "Failed to create category" };
  }
}


// UPDATE
export async function updateCategory(data: UpdateCategoryData) {
  try {
    const category = await db.category.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${data.id}`);

    return { success: true, data: category };
  } catch (error) {
    console.error("Update category error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Category name already exists" };
      }

      if (error.code === "P2025") {
        return { success: false, error: "Category not found" };
      }
    }

    return { success: false, error: "Failed to update category" };
  }
}

// DELETE
export async function deleteCategory(id: string) {
  try {
    // Check if category has products
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    if (category._count.products > 0) {
      return {
        success: false,
        error:
          "Cannot delete category with existing products. Please remove all products first.",
      };
    }

    await db.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("Delete category error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {


        if (error.code === "P2025") {
          return { success: false, error: "Category not found" };
        }
    }


    return { success: false, error: "Failed to delete category" };
  }
}

// BULK DELETE
export async function deleteCategoriesBulk(ids: string[]) {
  try {
    // Check if any categories have products
    const categoriesWithProducts = await db.category.findMany({
      where: { id: { in: ids } },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const categoriesWithProductsNames = categoriesWithProducts
      .filter((cat) => cat._count.products > 0)
      .map((cat) => cat.name);

    if (categoriesWithProductsNames.length > 0) {
      return {
        success: false,
        error: `Cannot delete categories with products: ${categoriesWithProductsNames.join(
          ", "
        )}`,
      };
    }

    const result = await db.category.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/categories");
    return {
      success: true,
      message: `Successfully deleted ${result.count} categories`,
    };
  } catch (error) {
    console.error("Bulk delete categories error:", error);
    return { success: false, error: "Failed to delete categories" };
  }
}
