// server/actions/cart-actions.ts

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  CartItemUI,
  LocalCartItem,
  GetCartDataResult,
  CartOperationResult,
  BaseCartItem,
  baseCartItemToUI,
  createBaseCartItem,
  isBaseCartItemArray,
} from "@/types/cart-types";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    return user ? session.user.id : null;
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

async function requireAuthenticatedUser(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    throw new Error("User not authenticated or not found in database");
  }
  return userId;
}

// Helper to safely get and parse cart items from the database
function getParsedCartItems(cart: { items: any } | null): BaseCartItem[] {
  if (!cart || !cart.items) {
    return [];
  }

  // Use the type guard to safely parse the JSON blob
  if (isBaseCartItemArray(cart.items)) {
    return cart.items;
  }

  console.warn("Invalid cart items format in database:", cart.items);
  return [];
}

async function getOrCreateUserCart(userId: string) {
  let cart = await db.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: {
        userId,
        items: [] as any, // Prisma accepts an empty array for a JSON field
      },
    });
  }

  return cart;
}

// Get product variants for local cart items (guest users)
export async function getProductVariants(
  localCartItems: LocalCartItem[]
): Promise<CartOperationResult> {
  try {
    if (localCartItems.length === 0) {
      return { success: true, updatedItems: [] };
    }

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
      },
    });

    const cartItems: CartItemUI[] = localCartItems
      .map((localItem) => {
        const variantWithProduct = variants.find(
          (v) => v.id === localItem.productVariantId
        );

        if (!variantWithProduct || !variantWithProduct.product.isAvailable) {
          console.warn(
            `Product variant ${localItem.productVariantId} not found or product is unavailable.`
          );
          return null;
        }

        const quantity = Math.min(localItem.quantity, variantWithProduct.stock);
        if (quantity <= 0) return null; // Don't add if no stock is available

        const baseCartItem = createBaseCartItem(variantWithProduct, quantity);
        return baseCartItemToUI(baseCartItem);
      })
      .filter((item): item is CartItemUI => item !== null);

    return { success: true, updatedItems: cartItems };
  } catch (error) {
    console.error("Get product variants error:", error);
    return { success: false, error: getErrorMessage(error), updatedItems: [] };
  }
}

// Add item to cart (only for authenticated users)
export async function addToCart(
  productVariantId: string,
  quantity = 1
): Promise<CartOperationResult> {
  try {
    const userId = await requireAuthenticatedUser();

    const variant = await db.productVariant.findUnique({
      where: { id: productVariantId },
      include: { product: true },
    });

    if (!variant) return { success: false, error: "Product variant not found" };
    if (!variant.product.isAvailable)
      return { success: false, error: "Product is not available" };
    if (variant.stock < quantity)
      return { success: false, error: "Insufficient stock" };

    const cart = await getOrCreateUserCart(userId);
    const existingItems = getParsedCartItems(cart);

    const existingItemIndex = existingItems.findIndex(
      (item) => item.variantSnapshot.id === productVariantId
    );

    let updatedItems: BaseCartItem[];

    if (existingItemIndex >= 0) {
      const newQuantity = existingItems[existingItemIndex].quantity + quantity;
      if (variant.stock < newQuantity)
        return { success: false, error: "Insufficient stock" };

      updatedItems = existingItems.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: newQuantity } : item
      );
    } else {
      const newBaseCartItem = createBaseCartItem(variant, quantity);
      updatedItems = [...existingItems, newBaseCartItem];
    }

    await db.cart.update({
      where: { id: cart.id },
      data: { items: updatedItems as any, updatedAt: new Date() },
    });

    const cartItemsUI = updatedItems.map(baseCartItemToUI);

    revalidatePath("/cart");
    return { success: true, updatedItems: cartItemsUI };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// Update cart item quantity (only for authenticated users)
export async function updateCartItemQuantity(
  productVariantId: string,
  quantity: number
): Promise<CartOperationResult> {
  try {
    const userId = await requireAuthenticatedUser();
    const cart = await db.cart.findUnique({ where: { userId } });

    if (!cart) return { success: false, error: "Cart not found" };

    const existingItems = getParsedCartItems(cart);
    let updatedItems: BaseCartItem[];

    if (quantity <= 0) {
      updatedItems = existingItems.filter(
        (item) => item.variantSnapshot.id !== productVariantId
      );
    } else {
      const variant = await db.productVariant.findUnique({
        where: { id: productVariantId },
        select: { stock: true },
      });

      if (!variant)
        return { success: false, error: "Product variant not found" };
      if (variant.stock < quantity)
        return { success: false, error: "Insufficient stock" };

      const itemExists = existingItems.some(
        (item) => item.variantSnapshot.id === productVariantId
      );
      if (!itemExists)
        return { success: false, error: "Item not found in cart" };

      updatedItems = existingItems.map((item) =>
        item.variantSnapshot.id === productVariantId
          ? { ...item, quantity }
          : item
      );
    }

    await db.cart.update({
      where: { id: cart.id },
      data: { items: updatedItems as any, updatedAt: new Date() },
    });

    const cartItemsUI = updatedItems.map(baseCartItemToUI);

    revalidatePath("/cart");
    return { success: true, updatedItems: cartItemsUI };
  } catch (error) {
    console.error("Update cart item error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// Remove item from cart (only for authenticated users)
export async function removeFromCart(
  productVariantId: string
): Promise<CartOperationResult> {
  try {
    const userId = await requireAuthenticatedUser();
    const cart = await db.cart.findUnique({ where: { userId } });

    if (!cart) return { success: true, updatedItems: [] };

    const existingItems = getParsedCartItems(cart);
    const updatedItems = existingItems.filter(
      (item) => item.variantSnapshot.id !== productVariantId
    );

    await db.cart.update({
      where: { id: cart.id },
      data: { items: updatedItems as any, updatedAt: new Date() },
    });

    const cartItemsUI = updatedItems.map(baseCartItemToUI);

    revalidatePath("/cart");
    return { success: true, updatedItems: cartItemsUI };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// Merge localStorage cart with server cart (called when user authenticates)
export async function mergeLocalStorageCart(
  localCartItems: LocalCartItem[]
): Promise<CartOperationResult> {
  try {
    const userId = await requireAuthenticatedUser();
    const cart = await getOrCreateUserCart(userId);

    if (localCartItems.length === 0) {
      const existingItems = getParsedCartItems(cart);
      const updatedCartItemsUI = existingItems.map(baseCartItemToUI);
      return { success: true, updatedItems: updatedCartItemsUI };
    }

    const variantIds = localCartItems.map((item) => item.productVariantId);

    const variants = await db.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const existingItems = getParsedCartItems(cart);
    const updatedItems = [...existingItems];

    for (const localItem of localCartItems) {
      const variant = variants.find((v) => v.id === localItem.productVariantId);

      if (!variant || !variant.product.isAvailable) {
        console.warn(
          `Variant ${localItem.productVariantId} not found or unavailable during merge.`
        );
        continue;
      }

      const existingItemIndex = updatedItems.findIndex(
        (item) => item.variantSnapshot.id === localItem.productVariantId
      );

      if (existingItemIndex >= 0) {
        const newQuantity =
          updatedItems[existingItemIndex].quantity + localItem.quantity;
        updatedItems[existingItemIndex].quantity = Math.min(
          newQuantity,
          variant.stock
        );
      } else {
        const quantity = Math.min(localItem.quantity, variant.stock);
        if (quantity > 0) {
          updatedItems.push(createBaseCartItem(variant, quantity));
        }
      }
    }

    await db.cart.update({
      where: { id: cart.id },
      data: { items: updatedItems as any, updatedAt: new Date() },
    });

    const finalCartItemsUI = updatedItems.map(baseCartItemToUI);
    revalidatePath("/cart");
    revalidatePath("/");
    return { success: true, updatedItems: finalCartItemsUI };
  } catch (error) {
    console.error("Merge localStorage cart error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// Get cart data for authenticated user
export async function getCartDataForAuthUser(): Promise<GetCartDataResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) return { items: [], count: 0 };

  try {
    const cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) return { items: [], count: 0 };

    const cartItemsData = getParsedCartItems(cart);

    // Filter out zero-quantity items
    const validItems = cartItemsData.filter((item) => item.quantity > 0);

    const items = validItems.map(baseCartItemToUI);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, count };
  } catch (dbError) {
    console.error("Get cart data database error:", dbError);
    throw new Error("Failed to fetch cart data.");
  }
}

// Clear cart for authenticated user
export async function clearCart(): Promise<CartOperationResult> {
  try {
    const userId = await requireAuthenticatedUser();

    await db.cart.update({
      where: { userId },
      data: { items: [] as any, updatedAt: new Date() },
    });

    revalidatePath("/cart");
    return { success: true, updatedItems: [] };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// Get cart item count for authenticated user (useful for header badge)
export async function getCartItemCount(): Promise<number> {
  const userId = await getAuthenticatedUserId();

  if (!userId) return 0;

  try {
    const cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) return 0;

    const cartItemsData = getParsedCartItems(cart);
    return cartItemsData.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error("Get cart item count error:", error);
    return 0;
  }
}

// Validate cart items against current stock (useful for checkout)
export async function validateCartItems(): Promise<{
  valid: boolean;
  issues: Array<{
    variantId: string;
    issue: string;
    currentStock?: number;
    requestedQuantity?: number;
  }>;
}> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId)
      return {
        valid: false,
        issues: [{ variantId: "", issue: "User not authenticated" }],
      };

    const cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) return { valid: true, issues: [] };

    const cartItemsData = getParsedCartItems(cart);
    if (cartItemsData.length === 0) return { valid: true, issues: [] };

    const variantIds = cartItemsData.map((item) => item.variantSnapshot.id);

    const currentVariants = await db.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const issues: Array<{
      variantId: string;
      issue: string;
      currentStock?: number;
      requestedQuantity?: number;
    }> = [];

    for (const cartItem of cartItemsData) {
      const currentVariant = currentVariants.find(
        (v) => v.id === cartItem.variantSnapshot.id
      );

      if (!currentVariant) {
        issues.push({
          variantId: cartItem.variantSnapshot.id,
          issue: "Product variant no longer exists",
        });
        continue;
      }

      if (!currentVariant.product.isAvailable) {
        issues.push({
          variantId: cartItem.variantSnapshot.id,
          issue: "Product is no longer available",
        });
        continue;
      }

      if (currentVariant.stock < cartItem.quantity) {
        issues.push({
          variantId: cartItem.variantSnapshot.id,
          issue: "Insufficient stock",
          currentStock: currentVariant.stock,
          requestedQuantity: cartItem.quantity,
        });
      }
    }

    return { valid: issues.length === 0, issues };
  } catch (error) {
    console.error("Validate cart items error:", error);
    return {
      valid: false,
      issues: [{ variantId: "", issue: "Failed to validate cart" }],
    };
  }
}

// Update multiple cart items at once (useful for bulk operations)
export async function updateMultipleCartItems(
  updates: Array<{ productVariantId: string; quantity: number }>
): Promise<CartOperationResult> {
  try {
    const userId = await requireAuthenticatedUser();
    const cart = await db.cart.findUnique({ where: { userId } });

    if (!cart) return { success: false, error: "Cart not found" };

    const existingItems = getParsedCartItems(cart);
    let updatedItems = [...existingItems];

    // Apply all updates
    for (const update of updates) {
      const itemIndex = updatedItems.findIndex(
        (item) => item.variantSnapshot.id === update.productVariantId
      );

      if (update.quantity <= 0) {
        // Remove item if quantity is 0 or negative
        if (itemIndex >= 0) {
          updatedItems.splice(itemIndex, 1);
        }
      } else if (itemIndex >= 0) {
        // Update existing item
        const variant = await db.productVariant.findUnique({
          where: { id: update.productVariantId },
          select: { stock: true },
        });

        if (!variant) continue; // Skip invalid variants
        if (variant.stock < update.quantity) continue; // Skip items with insufficient stock

        updatedItems[itemIndex].quantity = update.quantity;
      }
      // Note: We don't add new items in bulk update, only modify existing ones
    }

    await db.cart.update({
      where: { id: cart.id },
      data: { items: updatedItems as any, updatedAt: new Date() },
    });

    const cartItemsUI = updatedItems.map(baseCartItemToUI);

    revalidatePath("/cart");
    return { success: true, updatedItems: cartItemsUI };
  } catch (error) {
    console.error("Update multiple cart items error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
