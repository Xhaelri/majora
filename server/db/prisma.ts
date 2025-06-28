import { db } from "@/lib/prisma";
import { FullProduct } from "@/types/product";

export const getAllProducts = async () => {
  try {
    const products: FullProduct[] = await db.product.findMany({
      include: {
        images: true,
        category: true,
        reviews: true,
        variants: {
          include: {
            size: true,
            color: true,
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



export const getProductBySlug = async (slug: string) => {
  try {
    const productData = await db.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        isLimitedEdition: true,
        images: {
          select: {
            url: true,
            altText: true,
          },
        },
        variants: {
          select: {
            id: true,
            stock: true,
            colorId: true, 
            size: {
              select: {
                id: true,
                name: true,
              },
            },
            color: {
              select: {
                id: true,
                name: true,
              },
            },
            // Crucial: Select only the necessary fields for the nested product
            // This ensures no Date objects are brought in through this relation
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                salePrice: true,
                isLimitedEdition: true,
                images: {
                  select: {
                    url: true,
                    altText: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return productData;
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
};
