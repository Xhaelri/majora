// server/actions/search-actions.ts
import { db } from "@/lib/prisma"; // Adjust import path as needed
import type { Category, Product, ProductVariant } from "@prisma/client";

// Extended types with relations
export type ProductWithRelations = Product & {
  variants: ProductVariant[];
  category: Category | null;
};

export async function getShopData() {
  try {
    const [products, categories] = await Promise.all([
      // Fetch all products with their variants and categories
      db.product.findMany({
        include: {
          variants: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      
      // Fetch all categories
      db.category.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return {
      products: products as ProductWithRelations[],
      categories,
    };
  } catch (error) {
    console.error("Error fetching shop data:", error);
    return {
      products: [] as ProductWithRelations[],
      categories: [] as Category[],
    };
  }
}

export async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const products = await db.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            nameAr: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            descriptionAr: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            category: {
              OR: [
                {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
                {
                  nameAr: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ],
      },
      include: {
        variants: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products as ProductWithRelations[];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function getProductsByCategory(categoryName: string) {
  try {
    const products = await db.product.findMany({
      where: {
        category: {
          OR: [
            {
              name: {
                equals: categoryName,
                mode: 'insensitive',
              },
            },
            {
              nameAr: {
                equals: categoryName,
                mode: 'insensitive',
              },
            },
          ],
        },
      },
      include: {
        variants: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products as ProductWithRelations[];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

export async function getFilteredProducts({
  categoryIds,
  priceRange,
  availability,
  searchQuery,
}: {
  categoryIds?: string[];
  priceRange?: { from: number; to: number };
  availability?: "in-stock" | "out-of-stock";
  searchQuery?: string;
}) {
  try {
    const whereClause: any = {};

    // Search query filter
    if (searchQuery && searchQuery.trim()) {
      whereClause.OR = [
        {
          name: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          nameAr: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          descriptionAr: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Category filter
    if (categoryIds && categoryIds.length > 0) {
      whereClause.categoryId = {
        in: categoryIds,
      };
    }

    // Price range filter
    if (priceRange) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            {
              AND: [
                { salePrice: { gte: priceRange.from } },
                { salePrice: { lte: priceRange.to } },
                { salePrice: { not: null } },
              ],
            },
            {
              AND: [
                { price: { gte: priceRange.from } },
                { price: { lte: priceRange.to } },
                { salePrice: null },
              ],
            },
          ],
        },
      ];
    }

    // Availability filter (handled at application level since it depends on variant stock)
    const products = await db.product.findMany({
      where: whereClause,
      include: {
        variants: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let filteredProducts = products as ProductWithRelations[];

    // Apply availability filter
    if (availability) {
      filteredProducts = filteredProducts.filter(product => {
        const hasStock = product.variants.some(variant => variant.stock > 0);
        return availability === "in-stock" ? hasStock : !hasStock;
      });
    }

    return filteredProducts;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return [];
  }
}