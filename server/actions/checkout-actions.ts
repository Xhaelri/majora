"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { getCartData } from "./cart";
import { applyDiscount, clearCart } from "./cart";

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

export async function createCheckoutSession(
  billingData: BillingData, 
  discountCode?: string,
  shippingCost?: number
) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { error: "User not authenticated." };
  }

  if (typeof shippingCost !== 'number') {
      return { error: "Shipping cost is not determined." };
  }

  const { items: cartItems, count: cartCount } = await getCartData();

  if (cartCount === 0) {
    return { error: "Your cart is empty." };
  }

  const subtotal = cartItems.reduce(
    (acc, item) =>
      acc +
      item.productVariant.product.price * item.quantity,
    0
  );

  const saleDiscount = cartItems.reduce(
    (acc, item) => {
        const {price, salePrice} = item.productVariant.product;
        if(salePrice) {
            return acc + (price - salePrice) * item.quantity;
        }
        return acc;
    }, 0
  );
  
  let couponDiscount = 0;
  let appliedDiscountCodeId: string | undefined = undefined;
  if(discountCode) {
      const discountResult = await applyDiscount(discountCode, subtotal);
      if(!discountResult.error && discountResult.discountAmount) {
          couponDiscount = discountResult.discountAmount;
          const codeData = await db.discountCode.findUnique({where: {code: discountCode}});
          appliedDiscountCodeId = codeData?.id;
      }
  }

  const totalAmount = subtotal - saleDiscount - couponDiscount + shippingCost;

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
    const authResponse = await fetch(
      "https://accept.paymob.com/api/auth/tokens",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
      }
    );
    const authData = await authResponse.json();
    const authToken = authData.token;

    const orderResponse = await fetch(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: "false",
          amount_cents: totalAmount * 100,
          currency: "EGP",
          merchant_order_id: order.id,
          items: cartItems.map((item) => ({
            name: item.productVariant.product.name,
            amount_cents:
              (item.productVariant.product.salePrice ??
                item.productVariant.product.price) * 100,
            description:
              item.productVariant.product.description ?? "No description",
            quantity: item.quantity,
          })),
        }),
      }
    );
    const orderData = await orderResponse.json();
    const paymobOrderId = orderData.id;

    await db.order.update({
      where: { id: order.id },
      data: { paymobOrderId: paymobOrderId.toString() },
    });

    // Use billing data if provided, otherwise fallback to user data
    const finalBillingData = billingData || {
      email: user.email,
      firstName: user.firstName || "NA",
      lastName: user.lastName || "NA",
      phoneNumber: "NA",
      apartment: "NA",
      floor: "NA",
      street: "NA",
      building: "NA",
      city: "NA",
      state: "NA",
      postalCode: "NA",
      country: "NA",
    };

    const paymentKeyResponse = await fetch(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: totalAmount * 100,
          expiration: 3600,
          order_id: paymobOrderId,
          billing_data: {
            email: finalBillingData.email,
            first_name: finalBillingData.firstName,
            last_name: finalBillingData.lastName,
            phone_number: finalBillingData.phoneNumber,
            apartment: finalBillingData.apartment || "NA",
            floor: finalBillingData.floor || "NA",
            street: finalBillingData.street || "NA",
            building: finalBillingData.building || "NA",
            shipping_method: "NA",
            postal_code: finalBillingData.postalCode || "NA",
            city: finalBillingData.city || "NA",
            country: finalBillingData.country || "NA",
            state: finalBillingData.state || "NA",
          },
          currency: "EGP",
          integration_id: process.env.PAYMOB_INTEGRATION_ID,
        }),
      }
    );
    const paymentKeyData = await paymentKeyResponse.json();
    const paymentKey = paymentKeyData.token;
await clearCart();
    return { paymentKey };
  } catch (error) {
    console.error(error);
    await db.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return { error: "Failed to create payment session." };
  }
}

export async function getShippingRate(governorate: string) {
    const rate = await db.shippingRate.findUnique({
        where: { governorate }
    });
    return rate?.cost ?? null;
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