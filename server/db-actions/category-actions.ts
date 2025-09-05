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

export async function getCategoryByName(name: string): Promise<CategoryActionResult> {
  try {
    // Convert URL format back to normal name (replace hyphens with spaces)
    const categoryName = name.replace(/-/g, ' ');

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
            isAvailable: true,
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
    console.error("Error fetching category by name:", error);
    return {
      data: null,
      success: false,
      error: "Failed to fetch category",
    };
  }
}

export async function getAllCategoriesWithProducts() {
  try {
    const categories = await db.category.findMany({
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
            isAvailable: true, 
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        name: 'asc', // or however you want to order categories
      },
    });

    // Filter out categories with no available products
    const categoriesWithProducts = categories.filter(
      category => category.products && category.products.length > 0
    );

    return { success: true, data: categoriesWithProducts };
  } catch (error) {
    console.error("Get all categories with products error:", error);
    return { success: false, error: "Failed to fetch categories with products" };
  }
}
