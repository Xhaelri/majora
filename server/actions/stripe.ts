"use server";

import { headers } from "next/headers";
import { stripe } from "../../lib/stripe";
import { getCartData } from "./cart";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import Stripe from "stripe"; // Import Stripe for type definitions

type OrderIemMetadata = {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
};

export async function fetchClientSecret(): Promise<string> {
  try {
    const session = await auth();
    const headersList = await headers();
    const origin = headersList.get("origin");

    if (!origin) {
      throw new Error("Origin header is required");
    }

    const { items: cartItems } = await getCartData();

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    const lineItems = cartItems.map((item) => {
      const product = item.productVariant.product;
      const price = product.salePrice || product.price;

      return {
        price_data: {
          currency: "egp",
          product_data: {
            name: product.name,
            description: `${item.productVariant.color?.name || "N/A"} - ${
              item.productVariant.size?.name || "N/A"
            }`,
            images:
              item.productVariant.images?.length > 0
                ? [item.productVariant.images[0].url]
                : undefined,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      };
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["EG"],
      },
      phone_number_collection: { enabled: true },
      mode: "payment",
      return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: session?.user?.id || "guest",
        cartId: cartItems[0]?.cartId || "",
        items: JSON.stringify(
          cartItems.map((item) => ({
            variantId: item.productVariant.id,
            quantity: item.quantity,
            priceAtPurchase:
              item.productVariant.product.salePrice ||
              item.productVariant.product.price,
          }))
        ),
      },
      ...(session?.user?.email && {
        customer_email: session.user.email,
      }),
      allow_promotion_codes: true,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "egp",
            },
            display_name: "Free shipping",
          },
        },
      ],
    });

    if (!checkoutSession.client_secret) {
      throw new Error("Failed to create checkout session");
    }

    return checkoutSession.client_secret;
  } catch (error) {
    console.error("Stripe embedded checkout error:", error);
    throw new Error("Failed to create checkout session");
  }
}

export async function retrieveCheckoutSession(sessionId: string) {
  try {
    const session = (await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["shipping", "shipping.address", "phone_number", "line_items", "payment_intent"],
    })) as Stripe.Checkout.Session & {
      shipping?: {
        address?: Stripe.Address | null;
      } | null;
    };

    return { session };
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return { error: "Failed to retrieve checkout session" };
  }
}

export async function handleSuccessfulPayment(sessionId: string) {
  try {
    const session = (await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["shipping", "shipping.address", "phone_number", "payment_intent"],
    })) as Stripe.Checkout.Session & {
      shipping?: {
        address?: Stripe.Address | null;
      } | null;
      customer_details?: {
        address?: Stripe.Address | null;
        phone?: string | null;
      } | null;
    };

    console.log("Retrieved session:", session); // Log the full session

    if (!session.customer_details?.address) {
      console.log("No customer address found:", session.customer_details);
      throw new Error("Shipping address is missing");
    }

    if (session.payment_status === "paid") {
      const subtotal = session.amount_subtotal
        ? session.amount_subtotal / 100
        : 0;
      const total = session.amount_total ? session.amount_total / 100 : 0;
      const shippingCost = 0;

      const itemMetadata = JSON.parse(session.metadata?.items || "[]");

      // Use customer_details.address and phone
      const shippingAddress =
        session.customer_details?.address?.line1 || "No shipping address provided";
      const governorate =
        session.customer_details?.address?.state || "Not provided";
      const phone = session.customer_details?.phone || "Not provided";

      console.log("Shipping Address:", shippingAddress); // Log the address
      console.log("Governorate:", governorate); // Log the governorate
      console.log("Phone Number:", phone); // Log the phone number

      // Update or create user record
      const userId = session.metadata?.userId;
      if (userId && userId !== "guest") {
        await db.user.upsert({
          where: { id: userId },
          update: {
            phone,
            address: shippingAddress, // Store a simplified address (e.g., line1)
          },
          create: {
            id: userId,
            phone,
            address: shippingAddress,
          },
        });
      }

      const order = await db.order.create({
        data: {
          userId: userId !== "guest" ? userId : undefined,
          stripeSessionId: sessionId,
          status: "PROCESSING",
          subtotal,
          totalAmount: total,
          shippingAddress,
          shippingCost,
          governorate,
          paymentMethod: "stripe",
          orderItems: {
            create: itemMetadata.map((item: OrderIemMetadata) => ({
              productVariantId: item.variantId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      if (session.metadata?.cartId) {
        await db.cartItem.deleteMany({
          where: { cartId: session.metadata.cartId },
        });
      }

      return { success: true, orderId: order.id };
    }

    return { success: false, error: "Payment not completed" };
  } catch (error) {
    console.error("Error handling successful payment:", error);
    return { success: false, error: "Failed to process successful payment" };
  }
}