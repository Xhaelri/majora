'use server'

import { db } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath, unstable_noStore } from 'next/cache'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

export type GuestCartItem = {
  productVariantId: string
  quantity: number
}

async function getCartUser() {
  const session = await auth()

  if (session?.user?.id) {
    return db.user.findUnique({
      where: { id: session.user.id },
    })
  }

  const anonymousId = (await cookies()).get('guest_cart_id')?.value
  if (anonymousId) {
    const guestUser = await db.user.findUnique({
      where: { anonymousId, isGuest: true },
    })
    if (guestUser) return guestUser
  }

  const newAnonymousId = randomUUID()
  const guestUser = await db.user.create({
    data: {
      isGuest: true,
      anonymousId: newAnonymousId,
    },
  })

  ;(await cookies()).set('guest_cart_id', newAnonymousId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return guestUser
}

async function getOrCreateCart(userId: string) {
  let cart = await db.cart.findUnique({
    where: { userId },
    include: { items: true } // MODIFIED: Include items
  })

  if (!cart) {
    cart = await db.cart.create({
      data: { userId },
      include: { items: true }
    })
  }
  return cart
}

export async function addToCart(productVariantId: string, quantity = 1) {
  const user = await getCartUser()
  if (!user) throw new Error('Could not identify user.')

  const cart = await getOrCreateCart(user.id)

  const existingItem = await db.cartItem.findUnique({
    where: {
      cartId_productVariantId: {
        cartId: cart.id,
        productVariantId,
      },
    },
  })

  if (existingItem) {
    await db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    })
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId,
        quantity,
      },
    })
  }

  revalidatePath('/cart')
  return { success: true }
}

export async function updateCartItemQuantity(productVariantId: string, quantity: number) {
    const user = await getCartUser()
    if (!user) throw new Error('Could not identify user.')

    const cart = await db.cart.findUnique({ where: { userId: user.id } })
    if (!cart) throw new Error('Cart not found.')

    if (quantity <= 0) {
        await db.cartItem.deleteMany({
            where: { cartId: cart.id, productVariantId },
        })
    } else {
        await db.cartItem.updateMany({
            where: { cartId: cart.id, productVariantId },
            data: { quantity },
        })
    }

    revalidatePath('/cart')
    return { success: true }
}

export async function removeFromCart(productVariantId: string) {
    const user = await getCartUser()
    if (!user) throw new Error('Could not identify user.')

    const cart = await db.cart.findUnique({ where: { userId: user.id } })
    if (!cart) return { success: true } 

    await db.cartItem.deleteMany({
        where: { cartId: cart.id, productVariantId },
    })

    revalidatePath('/cart')
    return { success: true }
}

export async function mergeGuestCartWithUserCart(authenticatedUserId: string) {
  const anonymousId = (await cookies()).get('guest_cart_id')?.value
  if (!anonymousId) return { success: true }

  const guestUser = await db.user.findUnique({
    where: { anonymousId, isGuest: true },
    include: { cart: { include: { items: true } } },
  })

  const guestCart = guestUser?.cart
  if (!guestCart || guestCart.items.length === 0) {
    if (guestUser) await db.user.delete({ where: { id: guestUser.id } }).catch(console.error);
    (await cookies()).delete('guest_cart_id')
    return { success: true }
  }

  // **MODIFIED LOGIC**
  await db.$transaction(async (tx) => {
    // 1. Get the authenticated user's cart (or create it) and lock it for the transaction
    const authUserCart = await tx.cart.findUnique({
      where: { userId: authenticatedUserId },
      include: { items: true },
    }) || await tx.cart.create({
      data: { userId: authenticatedUserId },
      include: { items: true },
    });

    // 2. Merge guest items into the authenticated user's cart
    for (const guestItem of guestCart.items) {
      const existingAuthItem = authUserCart.items.find(
        (item) => item.productVariantId === guestItem.productVariantId
      );

      if (existingAuthItem) {
        // Update quantity if item already exists in auth cart
        await tx.cartItem.update({
          where: { id: existingAuthItem.id },
          data: { quantity: existingAuthItem.quantity + guestItem.quantity },
        });
      } else {
        // Create new item in auth cart if it doesn't exist
        await tx.cartItem.create({
          data: {
            cartId: authUserCart.id,
            productVariantId: guestItem.productVariantId,
            quantity: guestItem.quantity,
          },
        });
      }
    }

    // 3. Clean up the guest user, which will cascade and delete their cart and items
    await tx.user.delete({ where: { id: guestUser.id } });
  });

  (await cookies()).delete('guest_cart_id');

  revalidatePath('/cart');
  revalidatePath('/');
  
  return { success: true };
}


export async function getCartData() {
    unstable_noStore();


    const user = await getCartUser();
    if (!user) return { items: [], count: 0 };

    const cart = await db.cart.findUnique({
        where: { userId: user.id },
        include: {
            items: {
                include: {
                    productVariant: {
                        include: {
                            product: true,
                            color: true,
                            size: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    const items = cart?.items || [];
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, count };
}