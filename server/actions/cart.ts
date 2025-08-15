"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { CartItem, getCartDataForAuthUserResult } from "@/types/cartTypes";

export type LocalCartItem = {
  productVariantId: string;
  quantity: number;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return session.user.id;
}

async function getOrCreateCart(userId: string) {
  let cart = await db.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: { userId },
      include: { items: true },
    });
  }

  return cart;
}

export async function getProductVariants(localCartItems: LocalCartItem[]) {
  try {
    const productVariantIds = localCartItems.map(
      (item) => item.productVariantId
    );

    const variants = await db.productVariant.findMany({
      where: {
        id: {
          in: productVariantIds,
        },
      },
      include: {
        product: true,
        color: true,
        size: true,
        images: {
          select: {
            url: true,
            altText: true,
            altTextAr: true,
          },
          take: 2,
        },
      },
    });

    const cartItems = localCartItems.map((localItem) => {
      const variantDetail = variants.find(
        (v) => v.id === localItem.productVariantId
      );
      return {
        productVariant: variantDetail,
        quantity: localItem.quantity,
      };
    });

    return { success: true, items: cartItems as unknown as CartItem[] };
  } catch (error) {
    console.error("Get product variants error:", error);
    return { success: false, error: getErrorMessage(error), items: [] };
  }
}

export async function addToCart(productVariantId: string, quantity = 1) {
  try {
    const userId = await getAuthenticatedUser();
    const cart = await getOrCreateCart(userId);

    await db.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        productVariantId,
        quantity,
      },
    });

    const updatedItems = await getCartItemsByCartId(cart.id);
    return { success: true, updatedItems };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCartItemQuantity(
  productVariantId: string,
  quantity: number
) {
  try {
    const userId = await getAuthenticatedUser();
    const cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Cart not found.");

    if (quantity <= 0) {
      await db.cartItem.deleteMany({
        where: { cartId: cart.id, productVariantId },
      });
    } else {
      await db.cartItem.updateMany({
        where: { cartId: cart.id, productVariantId },
        data: { quantity },
      });
    }

    const updatedItems = await getCartItemsByCartId(cart.id);
    return { success: true, updatedItems };
  } catch (error) {
    console.error("Update cart item error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function removeFromCart(productVariantId: string) {
  try {
    const userId = await getAuthenticatedUser();
    const cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) return { success: true };

    await db.cartItem.deleteMany({
      where: { cartId: cart.id, productVariantId },
    });

    const updatedItems = await getCartItemsByCartId(cart.id);
    return { success: true, updatedItems };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function mergeLocalStorageCart(localCartItems: LocalCartItem[]) {
  try {
    const userId = await getAuthenticatedUser();
    const cart = await getOrCreateCart(userId);

    await db.$transaction(async (tx) => {
      for (const localItem of localCartItems) {
        await tx.cartItem.upsert({
          where: {
            cartId_productVariantId: {
              cartId: cart.id,
              productVariantId: localItem.productVariantId,
            },
          },
          update: {
            quantity: {
              increment: localItem.quantity,
            },
          },
          create: {
            cartId: cart.id,
            productVariantId: localItem.productVariantId,
            quantity: localItem.quantity,
          },
        });
      }
    });

    revalidatePath("/cart");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Merge localStorage cart error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCartDataForAuthUser(): Promise<getCartDataForAuthUserResult> {
  let userId;
  try {
    userId = await getAuthenticatedUser();
  } catch (error) {
    console.log(error);

    return { items: [], count: 0 };
  }

  try {
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                color: true,
                size: true,
                product: true,
                images: {
                  select: { url: true, altText: true, altTextAr: true },
                  take: 2,
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const items = cart?.items || [];
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items: items as CartItem[], count };
  } catch (dbError) {
    console.error("Get cart data database error:", dbError);

    throw new Error("Failed to fetch cart data.");
  }
}

async function getCartItemsByCartId(cartId: string) {
  return db.cartItem.findMany({
    where: { cartId },
    include: {
      productVariant: {
        include: {
          product: true,
          color: true,
          size: true,
          images: {
            select: {
              url: true,
              altText: true,
              altTextAr: true,
            },
            take: 2,
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

