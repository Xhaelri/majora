"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, unstable_noStore } from "next/cache";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { GetCartDataResult } from "@/types/product";

export type GuestCartItem = {
  productVariantId: string;
  quantity: number;
};

// Helper function to handle errors consistently
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function getCartUser() {
  const session = await auth();

  if (session?.user?.id) {
    return db.user.findUnique({
      where: { id: session.user.id },
    });
  }

  const anonymousId = (await cookies()).get("guest_cart_id")?.value;
  if (anonymousId) {
    const guestUser = await db.user.findUnique({
      where: { anonymousId, isGuest: true },
    });
    if (guestUser) return guestUser;
  }

  const newAnonymousId = randomUUID();
  const guestUser = await db.user.create({
    data: {
      isGuest: true,
      anonymousId: newAnonymousId,
    },
  });

  (await cookies()).set("guest_cart_id", newAnonymousId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return guestUser;
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

export async function addToCart(productVariantId: string, quantity = 1) {
  try {
    const user = await getCartUser();
    if (!user) throw new Error("Could not identify user.");

    const cart = await getOrCreateCart(user.id);

    // Use upsert for better performance and atomicity
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

    // Revalidate paths for better cache management
    revalidatePath("/cart");
    revalidatePath("/api/cart");
    
    return { success: true };
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
    const user = await getCartUser();
    if (!user) throw new Error("Could not identify user.");

    const cart = await db.cart.findUnique({ where: { userId: user.id } });
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

    revalidatePath("/cart");
    revalidatePath("/api/cart");
    
    return { success: true };
  } catch (error) {
    console.error("Update cart item error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function removeFromCart(productVariantId: string) {
  try {
    const user = await getCartUser();
    if (!user) throw new Error("Could not identify user.");

    const cart = await db.cart.findUnique({ where: { userId: user.id } });
    if (!cart) return { success: true };

    await db.cartItem.deleteMany({
      where: { cartId: cart.id, productVariantId },
    });

    revalidatePath("/cart");
    revalidatePath("/api/cart");
    
    return { success: true };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function mergeGuestCartWithUserCart(authenticatedUserId: string) {
  try {
    const anonymousId = (await cookies()).get("guest_cart_id")?.value;
    if (!anonymousId) return { success: true };

    const guestUser = await db.user.findUnique({
      where: { anonymousId, isGuest: true },
      include: { cart: { include: { items: true } } },
    });

    const guestCart = guestUser?.cart;
    if (!guestCart || guestCart.items.length === 0) {
      if (guestUser)
        await db.user
          .delete({ where: { id: guestUser.id } })
          .catch(console.error);
      (await cookies()).delete("guest_cart_id");
      return { success: true };
    }

    // Use transaction for atomicity
    await db.$transaction(async (tx) => {
      const authUserCart =
        (await tx.cart.findUnique({
          where: { userId: authenticatedUserId },
          include: { items: true },
        })) ||
        (await tx.cart.create({
          data: { userId: authenticatedUserId },
          include: { items: true },
        }));

      // Use upsert for better performance
      for (const guestItem of guestCart.items) {
        await tx.cartItem.upsert({
          where: {
            cartId_productVariantId: {
              cartId: authUserCart.id,
              productVariantId: guestItem.productVariantId,
            },
          },
          update: {
            quantity: {
              increment: guestItem.quantity,
            },
          },
          create: {
            cartId: authUserCart.id,
            productVariantId: guestItem.productVariantId,
            quantity: guestItem.quantity,
          },
        });
      }

      await tx.user.delete({ where: { id: guestUser.id } });
    });

    (await cookies()).delete("guest_cart_id");
    revalidatePath("/cart");
    revalidatePath("/");
    revalidatePath("/api/cart");

    return { success: true };
  } catch (error) {
    console.error("Merge cart error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCartData(): Promise<GetCartDataResult> {
  unstable_noStore();

  try {
    const user = await getCartUser();
    if (!user) return { items: [], count: 0 };

    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                color: true,
                size: true,
                images: true,
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const items = cart?.items || [];
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, count };
  } catch (error) {
    console.error("Get cart data error:", error);
    return { items: [], count: 0 };
  }
}