import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

interface PaymobWebhookData {
  obj: {
    id: number;
    pending: boolean;
    amount_cents: number;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_standalone_payment: boolean;
    is_voided: boolean;
    is_refunded: boolean;
    is_3d_secure: boolean;
    integration_id: number;
    profile_id: number;
    has_parent_transaction: boolean;
    order: {
      id: number;
      created_at: string;
      merchant_order_id: string;
    };
    created_at: string;
    currency: string;
    source_data: {
      pan: string;
      type: string;
      sub_type: string;
    };
    error_occured: boolean;
    owner: number;
    parent_transaction: null | Record<string, unknown>;
  };
  type: string;
}

type OrderStatus = "PROCESSING" | "CANCELLED" | "PENDING" | "PAID" | "FAILED";

function verifyWebhookSignature(
  data: PaymobWebhookData,
  signature: string
): boolean {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      return false;
    }

    // FIX: Concatenate values based on alphabetically sorted keys from the 'obj' object.
    const receivedObject = data.obj;
    const concatenatedString = [
      receivedObject.amount_cents,
      receivedObject.created_at,
      receivedObject.currency,
      receivedObject.error_occured,
      receivedObject.has_parent_transaction,
      receivedObject.id,
      receivedObject.integration_id,
      receivedObject.is_3d_secure,
      receivedObject.is_auth,
      receivedObject.is_capture,
      receivedObject.is_refunded,
      receivedObject.is_standalone_payment,
      receivedObject.is_voided,
      receivedObject.order.id,
      receivedObject.owner,
      receivedObject.pending,
      receivedObject.source_data.pan,
      receivedObject.source_data.sub_type,
      receivedObject.source_data.type,
      receivedObject.success,
    ].join("");

    const calculatedSignature = crypto
      .createHmac("sha512", hmacSecret)
      .update(concatenatedString)
      .digest("hex");

    return calculatedSignature === signature;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function clearUserCart(userId: string) {
  if (!userId) return;
  try {
    const cart = await db.cart.findUnique({ where: { userId } });
    if (cart) {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
}

function determineOrderStatus(
  transaction: PaymobWebhookData["obj"]
): OrderStatus {
  if (transaction.success && !transaction.error_occured) {
    return "PAID";
  }
  if (transaction.is_voided || transaction.is_refunded) {
    return "FAILED";
  }
  return "FAILED";
}

export async function POST(req: NextRequest) {
  try {
    // FIX: Read the 'hmac' from the URL search parameters, not the headers.
    const hmac = req.nextUrl.searchParams.get("hmac");
    if (!hmac) {
      return NextResponse.json({ error: "Missing HMAC" }, { status: 400 });
    }

    const rawBody = await req.text();
    let data: PaymobWebhookData;
    try {
      data = JSON.parse(rawBody);
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (
      process.env.NODE_ENV === "production" &&
      !verifyWebhookSignature(data, hmac)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { obj: transaction } = data;
    const merchantOrderId = transaction.order.merchant_order_id;

    if (!merchantOrderId) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: {
        merchantOrderId: merchantOrderId,
      },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    // Don't update the status if the order is already paid
    if (order.status === "PAID") {
        return NextResponse.json({
            success: true,
            message: "Webhook processed. Order already marked as PAID.",
        });
    }

    const newStatus = determineOrderStatus(transaction);

    await db.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        paymentTransactionId: transaction.id.toString(),
        updatedAt: new Date(),
      },
    });

    if (newStatus === "PAID" && order.userId) {
      await clearUserCart(order.userId);
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
