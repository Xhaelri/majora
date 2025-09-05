// server/actions/checkout-actions.ts

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { getCartDataForAuthUser } from "./cart-actions";
import {
  BillingData,
  CheckoutSessionResult,
  DiscountValidationResult,
} from "@/types/checkout-types";
import { CartItemUI, OrderItem } from "@/types/cart-types";

export async function validateDiscountCode(
  code: string,
  orderAmount: number
): Promise<DiscountValidationResult> {
  try {
    if (!code || code.trim() === "") {
      return { error: "Please enter a discount code" };
    }

    const discountCode = await db.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discountCode) {
      return { error: "Invalid discount code" };
    }

    if (!discountCode.isActive) {
      return { error: "This discount code is no longer active" };
    }

    if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
      return { error: "This discount code has expired" };
    }

    if (
      discountCode.minOrderAmount &&
      orderAmount < discountCode.minOrderAmount
    ) {
      return {
        error: `Minimum order amount of ${discountCode.minOrderAmount} EGP required for this discount`,
      };
    }

    let discountAmount = 0;
    if (discountCode.discountType === "PERCENTAGE") {
      discountAmount = Math.min(
        orderAmount * (discountCode.value / 100),
        orderAmount
      );
    } else {
      discountAmount = Math.min(discountCode.value, orderAmount);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      discount: {
        code: discountCode.code,
        amount: discountAmount,
        type:
          discountCode.discountType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
        value: discountCode.value,
      },
    };
  } catch (error) {
    console.error("Error validating discount code:", error);
    return { error: "Failed to validate discount code" };
  }
}

export async function applyDiscount(discountCode: string, orderAmount: number) {
  try {
    const result = await validateDiscountCode(discountCode, orderAmount);

    if (result.error) {
      return { error: result.error };
    }

    if (result.discount) {
      return {
        success: `Discount code "${result.discount.code}" applied successfully!`,
        discountAmount: result.discount.amount,
        discountCode: result.discount.code,
      };
    }

    return { error: "Invalid discount code" };
  } catch (error) {
    console.error("Error applying discount:", error);
    return { error: "Failed to apply discount code" };
  }
}

// Convert CartItemUI to OrderItem with proper structure
function createOrderItemFromCartUI(cartItem: CartItemUI): OrderItem {
  const priceAtPurchase = cartItem.salePrice ?? cartItem.price;

  return {
    quantity: cartItem.quantity,
    productSnapshot: {
      id: cartItem.productId,
      name: cartItem.name,
      nameAr: cartItem.nameAr,
      slug: cartItem.slug,
      description: cartItem.description,
      descriptionAr: cartItem.descriptionAr,
      price: cartItem.price,
      salePrice: cartItem.salePrice,
      categoryId: null, // We don't store categoryId in CartItemUI
      isAvailable: true, // Assume available if in cart
      isLimitedEdition: cartItem.isLimitedEdition,
    },
    variantSnapshot: {
      id: cartItem.variantId,
      size: cartItem.size,
      color: cartItem.color,
      colorHex: cartItem.colorHex,
      stock: cartItem.stock,
      images: cartItem.images,
    },
    productId: cartItem.productId,
    variantId: cartItem.variantId,
    priceAtPurchase,
  };
}

export async function createCheckoutSession(
  billingData: BillingData,
  discountCode?: string,
  shippingCost?: number
): Promise<CheckoutSessionResult> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { error: "User not authenticated." };
  }

  if (typeof shippingCost !== "number") {
    return { error: "Shipping cost is not determined." };
  }

  const cartData = await getCartDataForAuthUser();
  const cartItems = cartData.items;
  const cartCount = cartData.count;

  if (cartCount === 0) {
    return { error: "No items to checkout." };
  }

  // Calculate subtotal using original prices
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Calculate sale discount (difference between original and sale prices)
  const saleDiscount = cartItems.reduce((acc, item) => {
    const { price, salePrice } = item;
    if (salePrice && salePrice < price) {
      return acc + (price - salePrice) * item.quantity;
    }
    return acc;
  }, 0);

  const orderAmount = subtotal - saleDiscount;

  let couponDiscount = 0;
  let appliedDiscountCodeId: string | undefined = undefined;
  if (discountCode) {
    const discountResult = await validateDiscountCode(
      discountCode,
      orderAmount
    );
    if (discountResult.error) {
      return { error: `Discount error: ${discountResult.error}` };
    }
    if (discountResult.discount) {
      couponDiscount = discountResult.discount.amount;
      const codeData = await db.discountCode.findUnique({
        where: { code: discountCode },
      });
      appliedDiscountCodeId = codeData?.id;
    }
  }

  const totalAmount = subtotal - saleDiscount - couponDiscount + shippingCost;

  if (totalAmount < 0) {
    return { error: "Invalid order total calculated." };
  }

  // Convert cart items to order items format
  const orderItems: OrderItem[] = cartItems.map(createOrderItemFromCartUI);

  const order = await db.order.create({
    data: {
      userId: user.id,
      status: "PENDING",
      orderType: "CART",
      isBuyNow: false,
      items: orderItems as any, // Cast to any to satisfy Prisma's JsonValue type
      subtotal,
      totalAmount,
      discountAmount: saleDiscount + couponDiscount,
      shippingCost,
      discountCodeId: appliedDiscountCodeId,
      billingEmail: billingData.email,
      billingFirstName: billingData.firstName,
      billingLastName: billingData.lastName,
      billingPhone: billingData.phoneNumber,
      billingStreet: billingData.street,
      billingBuilding: billingData.building,
      billingApartment: billingData.apartment,
      billingFloor: billingData.floor,
      billingCity: billingData.city,
      billingState: billingData.state,
      billingPostalCode: billingData.postalCode,
      billingCountry: billingData.country,
    },
  });

  try {
    // Step 1: Get Paymob authentication token
    const authResponse = await fetch(
      "https://accept.paymob.com/api/auth/tokens",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
      }
    );

    if (!authResponse.ok) {
      throw new Error(`Paymob auth failed: ${await authResponse.text()}`);
    }

    const authData = await authResponse.json();
    const authToken = authData.token;

    // Step 2: Create Paymob order
    const orderResponse = await fetch(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: "false",
          amount_cents: Math.round(totalAmount * 100),
          currency: "EGP",
          merchant_order_id: order.id,
          items: orderItems.map((item) => ({
            name: item.productSnapshot.name,
            amount_cents: Math.round(item.priceAtPurchase * 100),
            description: item.productSnapshot.description ?? "No description",
            quantity: item.quantity,
          })),
        }),
      }
    );

    if (!orderResponse.ok) {
      throw new Error(
        `Paymob order creation failed: ${await orderResponse.text()}`
      );
    }

    const orderData = await orderResponse.json();
    const paymobOrderId = orderData.id;

    // Update our order with both Paymob's order ID and the merchantOrderId we sent them
    await db.order.update({
      where: { id: order.id },
      data: {
        paymobOrderId: paymobOrderId.toString(),
        merchantOrderId: order.id,
      },
    });

    // Step 3: Create payment key
    const baseUrl =
      process.env.NEXTAUTH_URL || "https://majora-shop.vercel.app";

    const paymentKeyResponse = await fetch(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: Math.round(totalAmount * 100),
          expiration: 3600,
          order_id: paymobOrderId,
          billing_data: {
            email: billingData.email,
            first_name: billingData.firstName,
            last_name: billingData.lastName,
            phone_number: billingData.phoneNumber,
            apartment: billingData.apartment || "NA",
            floor: billingData.floor || "NA",
            street: billingData.street || "NA",
            building: billingData.building || "NA",
            shipping_method: "NA",
            postal_code: billingData.postalCode || "NA",
            city: billingData.city || "NA",
            country: billingData.country || "NA",
            state: billingData.state || "NA",
          },
          currency: "EGP",
          integration_id: process.env.PAYMOB_INTEGRATION_ID,
          redirect_url: `${baseUrl}/api/webhooks/paymob/response`,
        }),
      }
    );

    if (!paymentKeyResponse.ok) {
      throw new Error(
        `Paymob payment key creation failed: ${await paymentKeyResponse.text()}`
      );
    }

    const paymentKeyData = await paymentKeyResponse.json();
    const paymentKey = paymentKeyData.token;

    console.log(
      `✅ Cart payment session created for order ${order.id}. Cart will be cleared after payment confirmation.`
    );

    return { paymentKey, orderId: order.id };
  } catch (error) {
    console.error("Payment session creation error:", error);
    await db.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return { error: "Failed to create payment session. Please try again." };
  }
}

export async function getShippingRate(governorate: string) {
  try {
    const rate = await db.shippingRate.findUnique({
      where: { governorate },
    });
    return rate?.cost ?? null;
  } catch (error) {
    console.error("Error fetching shipping rate:", error);
    return null;
  }
}

export async function getUserData(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        address: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        image: true,
        name: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function clearUserCart(userId: string) {
  try {
    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await db.cart.update({
        where: { id: cart.id },
        data: {
          items: [] as any,
          updatedAt: new Date(),
        },
      });
      console.log(`Cart cleared for user ${userId}`);
      return { success: "Cart cleared successfully" };
    }
    return { success: "Cart was already empty" };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { error: "Failed to clear cart" };
  }
}
