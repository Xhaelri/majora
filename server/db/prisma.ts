
// @/server/db/prisma.ts

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { FullProduct } from "@/types/product";

export const getAllProducts = async () => {
  try {
    const products: FullProduct[] = await db.product.findMany({
      include: {
        // images: true, // REMOVED
        category: true,
        reviews: true,
        variants: {
          include: {
            size: true,
            color: true,
            images: true, // ADDED
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

// ... (getProductBySlug remains the same as the last step)

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
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              isLimitedEdition: true,
            }
          }
        }
      }
    }
  });
}

// ... (getCart remains the same)
export async function getCart() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      cart: {
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: true,
                  size: true,
                  color: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user?.cart) {
    return { items: [], cartId: null }
  }

  return {
    items: user.cart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: item.productVariant.product,
      size: item.productVariant.size,
      color: item.productVariant.color,
      stock: item.productVariant.stock,
    })),
    cartId: user.cart.id,
  }
}
