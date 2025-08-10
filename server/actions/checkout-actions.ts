// Updated checkout-actions.ts with proper redirect URLs
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { getCartData } from "./cart";
import { clearCart } from "./cart";

interface BillingData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AppliedDiscount {
  code: string;
  amount: number;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

interface DiscountValidationResult {
  error?: string;
  discount?: AppliedDiscount;
}

// Secure server-side discount validation
export async function validateDiscountCode(
  code: string,
  orderAmount: number
): Promise<DiscountValidationResult> {
  try {
    if (!code || code.trim() === "") {
      return { error: "Please enter a discount code" };
    }

    // Find the discount code in database
    const discountCode = await db.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discountCode) {
      return { error: "Invalid discount code" };
    }

    if (!discountCode.isActive) {
      return { error: "This discount code is no longer active" };
    }

    // Check expiration
    if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
      return { error: "This discount code has expired" };
    }

    // Check minimum order amount
    if (
      discountCode.minOrderAmount &&
      orderAmount < discountCode.minOrderAmount
    ) {
      return {
        error: `Minimum order amount of ${discountCode.minOrderAmount} EGP required for this discount`,
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.discountType === "PERCENTAGE") {
      discountAmount = Math.min(
        orderAmount * (discountCode.value / 100),
        orderAmount
      );
    } else {
      discountAmount = Math.min(discountCode.value, orderAmount);
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      discount: {
        code: discountCode.code,
        amount: discountAmount,
        type:
          discountCode.discountType === "FIXED_AMOUNT"
            ? "FIXED"
            : discountCode.discountType === "PERCENTAGE"
            ? "PERCENTAGE"
            : "FIXED",
        value: discountCode.value,
      },
    };
  } catch (error) {
    console.error("Error validating discount code:", error);
    return { error: "Failed to validate discount code" };
  }
}

// Updated applyDiscount function for cart usage
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

// lib/actions/checkout-actions.ts

export async function createCheckoutSession(
  billingData: BillingData,
  discountCode?: string,
  shippingCost?: number,
  locale: string = "en"
) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { error: "User not authenticated." };
  }

  if (typeof shippingCost !== "number") {
    return { error: "Shipping cost is not determined." };
  }

  const { items: cartItems, count: cartCount } = await getCartData();

  if (cartCount === 0) {
    return { error: "Your cart is empty." };
  } // Calculate subtotal from database prices

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.productVariant.product.price * item.quantity,
    0
  ); // Calculate sale discount from database prices

  const saleDiscount = cartItems.reduce((acc, item) => {
    const { price, salePrice } = item.productVariant.product;
    if (salePrice && salePrice < price) {
      return acc + (price - salePrice) * item.quantity;
    }
    return acc;
  }, 0); // Calculate order amount after sale discount
  const orderAmount = subtotal - saleDiscount; // Re-validate discount code server-side
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
  } // Create the order first to get an ID

  const order = await db.order.create({
    data: {
      userId: user.id,
      status: "PENDING",
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
      orderItems: {
        create: cartItems.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          priceAtPurchase:
            item.productVariant.product.salePrice ??
            item.productVariant.product.price,
        })),
      },
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
    const authToken = authData.token; // Step 2: Create Paymob order

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
          merchant_order_id: order.id, // This is the ID we need to save!
          items: cartItems.map((item) => ({
            name: item.productVariant.product.name,
            amount_cents: Math.round(
              (item.productVariant.product.salePrice ??
                item.productVariant.product.price) * 100
            ),
            description:
              item.productVariant.product.description ?? "No description",
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
    const paymobOrderId = orderData.id; // Update our order with both Paymob's order ID and the merchantOrderId we sent them.

    // **THIS IS THE FIX**
    await db.order.update({
      where: { id: order.id },
      data: {
        paymobOrderId: paymobOrderId.toString(),
        merchantOrderId: order.id, // Save the ID you sent to Paymob
      },
    }); // Step 3: Create payment key

    const baseUrl =
      process.env.NEXTAUTH_URL || "https://sekra-seven.vercel.app";
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

    await clearCart();

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
