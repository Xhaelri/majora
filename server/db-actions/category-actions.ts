"use server";

import { db } from "@/lib/prisma"; // Adjust path as needed
import { FullProduct } from "@/types/product-types";
type CategoryWithFullProducts = {
  id: string;
  name: string;
  nameAr: string;
  createdAt: Date;
  updatedAt: Date;
  products: FullProduct[];
};

type CategoryActionResult = {
  data: CategoryWithFullProducts | null;
  success: boolean;
  error?: string;
};

// READ - Get all categories
export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include:{
            _count: {
              select: {
                products: true,
              },
            },
          }
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Get categories error:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}




export async function getCategoryById(categoryId: string): Promise<CategoryActionResult> {
  try {
    const category = await db.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        products: {
          include: {
            variants: {
              orderBy: [
                { size: 'asc' },
                { color: 'asc' }
              ]
            },
            category: true,
          },
          where: {
            isAvailable: true, // Only include available products
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return {
      data: category,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return {
      data: null,
      success: false,
      error: "Failed to fetch category",
    };
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryActionResult> {
  try {
    // Convert slug back to name (reverse of slugify process)
    const categoryName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const category = await db.category.findFirst({
      where: {
        OR: [
          { name: { equals: categoryName, mode: 'insensitive' } },
          { nameAr: { equals: categoryName, mode: 'insensitive' } },
        ],
      },
      include: {
        products: {
          include: {
            variants: {
              orderBy: [
                { size: 'asc' },
                { color: 'asc' }
              ]
            },
            category: true,
          },
          where: {
            isAvailable: true, // Only include available products
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return {
      data: category,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return {
      data: null,
      success: false,
      error: "Failed to fetch category",
    };
  }
}

// READ - Get category by name
export async function getCategoryByName(name: string) {
  try {
    const category = await db.category.findUnique({
      where: { name },
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

    return { success: true, data: category };
  } catch (error) {
    console.error("Get category by name error:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}
