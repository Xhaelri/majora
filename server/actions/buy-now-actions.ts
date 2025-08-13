// buy-now-actions.ts
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { validateDiscountCode } from "./checkout-actions"; // Reuse discount validation

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

interface BuyNowItem {
  productVariantId: string;
  quantity: number;
}

interface BuyNowSessionResult {
  paymentKey?: string;
  orderId?: string;
  error?: string;
}

// Get product variant details for buy now
export async function getBuyNowItemDetails(productVariantId: string, quantity: number = 1) {
  try {
    const variant = await db.productVariant.findUnique({
      where: { id: productVariantId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            description: true,
          }
        },
        size: {
          select: {
            id: true,
            name: true,
          }
        },
        color: {
          select: {
            id: true,
            name: true,
          }
        },
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
          take: 1 // Only get the first image
        }
      }
    });

    if (!variant) {
      return { error: "Product variant not found" };
    }

    if (variant.stock < quantity) {
      return { error: "Insufficient stock available" };
    }

    return {
      item: {
        id: `buynow-${variant.id}`,
        quantity,
        productVariantId: variant.id,
        productVariant: variant,
      }
    };
  } catch (error) {
    console.error("Error fetching buy now item details:", error);
    return { error: "Failed to fetch product details" };
  }
}

// Create buy now checkout session
export async function createBuyNowCheckoutSession(
  item: BuyNowItem,
  billingData: BillingData,
  shippingCost: number,
  discountCode?: string
): Promise<BuyNowSessionResult> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { error: "User not authenticated." };
  }

  try {
    // Get product variant details
    const itemDetails = await getBuyNowItemDetails(item.productVariantId, item.quantity);
    if (itemDetails.error || !itemDetails.item) {
      return { error: itemDetails.error || "Failed to get product details" };
    }

    const { productVariant } = itemDetails.item;
    
    // Calculate pricing
    const unitPrice = productVariant.product.salePrice ?? productVariant.product.price;
    const originalUnitPrice = productVariant.product.price;
    const subtotal = originalUnitPrice * item.quantity;
    const saleDiscount = productVariant.product.salePrice 
      ? (originalUnitPrice - productVariant.product.salePrice) * item.quantity 
      : 0;
    const orderAmount = subtotal - saleDiscount;

    // Validate discount code if provided
    let couponDiscount = 0;
    let appliedDiscountCodeId: string | undefined = undefined;
    if (discountCode) {
      const discountResult = await validateDiscountCode(discountCode, orderAmount);
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

    // Create the buy now order
    const order = await db.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        orderType: "BUY_NOW", // Mark as buy now order
        isBuyNow: true,
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
          create: {
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            priceAtPurchase: unitPrice,
          }
        },
      },
    });

    // Create Paymob payment session (similar to existing logic)
    const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
    });

    if (!authResponse.ok) {
      throw new Error(`Paymob auth failed: ${await authResponse.text()}`);
    }

    const authData = await authResponse.json();
    const authToken = authData.token;

    // Create Paymob order
    const orderResponse = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: Math.round(totalAmount * 100),
        currency: "EGP",
        merchant_order_id: order.id,
        items: [{
          name: productVariant.product.name,
          amount_cents: Math.round(unitPrice * 100),
          description: productVariant.product.description ?? "Buy Now Item",
          quantity: item.quantity,
        }],
      }),
    });

    if (!orderResponse.ok) {
      throw new Error(`Paymob order creation failed: ${await orderResponse.text()}`);
    }

    const orderData = await orderResponse.json();
    const paymobOrderId = orderData.id;

    // Update order with Paymob details
    await db.order.update({
      where: { id: order.id },
      data: {
        paymobOrderId: paymobOrderId.toString(),
        merchantOrderId: order.id,
      },
    });

    // Create payment key
    const baseUrl = process.env.NEXTAUTH_URL || "https://sekra-seven.vercel.app";

    const paymentKeyResponse = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
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
    });

    if (!paymentKeyResponse.ok) {
      throw new Error(`Paymob payment key creation failed: ${await paymentKeyResponse.text()}`);
    }

    const paymentKeyData = await paymentKeyResponse.json();
    const paymentKey = paymentKeyData.token;

    console.log(`✅ Buy Now payment session created for order ${order.id}`);

    return { paymentKey, orderId: order.id };

  } catch (error) {
    console.error("Buy Now payment session creation error:", error);
    return { error: "Failed to create payment session. Please try again." };
  }
}